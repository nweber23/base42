import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { User, Project } from '../models';
import { createUserCached, updateUserCached, getUserByLoginCached, createProjectCached } from './cachedDb';
import { getCache, setCache } from './cache';

// 42 API Base URL
const API_BASE_URL = 'https://api.intra.42.fr';

// OAuth2 Token interface
interface OAuth2Token {
  access_token: string;
  token_type: string;
  expires_in: number;
  created_at: number;
}

// 42 API Response interfaces
interface Api42User {
  id: number;
  email: string;
  login: string;
  first_name: string;
  last_name: string;
  usual_full_name: string;
  usual_first_name: string;
  url: string;
  phone: string;
  displayname: string;
  kind: string;
  image: {
    link: string;
    versions: {
      large: string;
      medium: string;
      small: string;
      micro: string;
    };
  };
  staff: boolean;
  correction_point: number;
  pool_month: string;
  pool_year: string;
  location: string | null;
  wallet: number;
  anonymize_date: string;
  data_erasure_date: string | null;
  created_at: string;
  updated_at: string;
  alumnized_at: string | null;
  alumni: boolean;
  active: boolean;
  cursus_users: Array<{
    grade: string;
    level: number;
    skills: Array<{
      id: number;
      name: string;
      level: number;
    }>;
    blackholed_at: string | null;
    id: number;
    begin_at: string;
    end_at: string | null;
    cursus_id: number;
    has_coalition: boolean;
    created_at: string;
    updated_at: string;
    user: {
      id: number;
      login: string;
      url: string;
    };
    cursus: {
      id: number;
      created_at: string;
      name: string;
      slug: string;
      kind: string;
    };
  }>;
  projects_users: Array<{
    id: number;
    occurrence: number;
    final_mark: number | null;
    status: string;
    validated: boolean | null;
    current_team_id: number | null;
    project: {
      id: number;
      name: string;
      slug: string;
      description: string;
      created_at: string;
      updated_at: string;
      exam: boolean;
    };
    cursus_ids: number[];
    marked_at: string | null;
    marked: boolean;
    retriable_at: string | null;
    created_at: string;
    updated_at: string;
  }>;
  campus: Array<{
    id: number;
    name: string;
    time_zone: string;
    language: {
      id: number;
      name: string;
      identifier: string;
      created_at: string;
      updated_at: string;
    };
    users_count: number;
    vogsphere_id: number;
    country: string;
    address: string;
    zip: string;
    city: string;
    website: string;
    facebook: string;
    twitter: string;
    active: boolean;
    public: boolean;
    email_extension: string;
    default_hidden_phone: boolean;
  }>;
}

interface Api42ProjectUser {
  id: number;
  occurrence: number;
  final_mark: number | null;
  status: string;
  validated: boolean | null;
  current_team_id: number | null;
  project: {
    id: number;
    name: string;
    slug: string;
    description: string;
    created_at: string;
    updated_at: string;
    exam: boolean;
  };
  teams: Array<{
    id: number;
    name: string;
    url: string;
    final_mark: number | null;
    project_id: number;
    created_at: string;
    updated_at: string;
    status: string;
    terminating_at: string | null;
    users: Array<{
      id: number;
      login: string;
      url: string;
      leader: boolean;
      occurrence: number;
      validated: boolean;
      projects_user_id: number;
    }>;
    locked: boolean;
    validated: boolean | null;
    closed: boolean;
    repo_url: string | null;
    repo_uuid: string;
    locked_at: string | null;
    closed_at: string | null;
    project_session_id: number;
    project_gitlab_path: string | null;
  }>;
  cursus_ids: number[];
  marked_at: string | null;
  marked: boolean;
  retriable_at: string | null;
  created_at: string;
  updated_at: string;
}

// Cache keys
const TOKEN_CACHE_KEY = '42api:oauth_token';
const PEERS_CACHE_KEY = (campusId: number) => `peers:active:${campusId}`;
const AVATAR_CACHE_KEY = (login: string) => `42api:avatar:${login}`;

// Minimal 42 location shape we need
interface Api42Location {
  id: number;
  begin_at: string;
  end_at: string | null;
  host: string;
  user: {
    id: number;
    login: string;
  };
}

// Minimal Campus shape for lookup
interface Api42Campus {
  id: number;
  name: string;
  city?: string;
}

class Api42Service {
  private axiosInstance: AxiosInstance;
  private token: OAuth2Token | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });
  }

  /**
   * Authenticate with 42 API using OAuth2 client credentials
   */
  private async authenticate(): Promise<void> {
    const apiUid = process.env.API_UID;
    const apiSecret = process.env.API_SECRET;

    if (!apiUid || !apiSecret) {
      throw new Error('API_UID and API_SECRET must be provided in environment variables');
    }

    try {
      const response: AxiosResponse<OAuth2Token> = await axios.post(
        `${API_BASE_URL}/oauth/token`,
        {
          grant_type: 'client_credentials',
          client_id: apiUid,
          client_secret: apiSecret,
        }
      );

      this.token = response.data;
      this.tokenExpiresAt = Date.now() + (this.token.expires_in * 1000);

      // Set default authorization header
      this.axiosInstance.defaults.headers.common['Authorization'] =
        `${this.token.token_type} ${this.token.access_token}`;

      // Store token in Redis with TTL (2h - 60s buffer)
      const ttlSec = Math.max(60, (this.token.expires_in ?? 7200) - 60);
      await setCache(TOKEN_CACHE_KEY, { token: this.token, expiresAt: this.tokenExpiresAt }, ttlSec);

      console.log('42 API authentication successful');
    } catch (error) {
      console.error('Failed to authenticate with 42 API:', error);
      throw error;
    }
  }

  /**
   * Ensure we have a valid token, refresh if necessary
   */
  private async ensureAuthenticated(): Promise<void> {
    // In-memory still valid?
    if (this.token && Date.now() < this.tokenExpiresAt - 60000) {
      return;
    }

    // Try Redis
    const cached = await getCache<{ token: OAuth2Token; expiresAt: number }>(TOKEN_CACHE_KEY);
    if (cached && cached.token && Date.now() < cached.expiresAt - 60000) {
      this.token = cached.token;
      this.tokenExpiresAt = cached.expiresAt;
      this.axiosInstance.defaults.headers.common['Authorization'] =
        `${this.token.token_type} ${this.token.access_token}`;
      return;
    }

    // Fallback to re-authenticate
    await this.authenticate();
  }

  /**
   * Map 42 API user data to our User model
   */
  private mapApi42UserToUser(api42User: Api42User): Omit<User, 'id'> {
    // Get the main cursus (42cursus) information
    const mainCursus = api42User.cursus_users.find(cu => cu.cursus.slug === '42cursus') || api42User.cursus_users[0];

    // Get primary campus
    const primaryCampus = api42User.campus[0];

    // Extract favorites/skills as strings
    const favorites = mainCursus?.skills?.map(skill => skill.name) || [];

    return {
      login: api42User.login,
      name: api42User.usual_full_name || `${api42User.first_name} ${api42User.last_name}`,
      level: mainCursus?.level || 0,
      campus: primaryCampus?.name || 'Unknown',
      location: api42User.location || '',
      favorites: favorites.slice(0, 10) // Limit to top 10 skills
    };
  }

  /**
   * Map 42 API project data to our Project model
   */
  private mapApi42ProjectToProject(projectUser: Api42ProjectUser): Omit<Project, 'id'> {
    // Get team information
    const team = projectUser.teams[0]; // Get the first/current team
    const teammates = team?.users?.map(user => user.login) || [];

    // Calculate deadline based on team terminating_at or use a default
    let deadline = new Date();
    if (team?.terminating_at) {
      deadline = new Date(team.terminating_at);
    } else {
      // Default to 30 days from creation if no deadline
      deadline = new Date(projectUser.created_at);
      deadline.setDate(deadline.getDate() + 30);
    }

    return {
      name: projectUser.project.name,
      deadline: deadline.toISOString(),
      teammates: teammates
    };
  }

  /**
   * Fetch user profile from 42 API by login
   */
  public async fetchUserProfile(login: string): Promise<User> {
    await this.ensureAuthenticated();

    try {
      const response: AxiosResponse<Api42User> = await this.axiosInstance.get(`/v2/users/${login}`);
      const api42User = response.data;

      // Map to our User model
      const userData = this.mapApi42UserToUser(api42User);

      // Check if user exists in our database
      const existingUser = await getUserByLoginCached(login);

      let user: User;
      if (existingUser) {
        // Update existing user
        user = await updateUserCached(existingUser.id, userData) as User;
        console.log(`Updated user profile for ${login}`);
      } else {
        // Create new user
        user = await createUserCached(userData);
        console.log(`Created new user profile for ${login}`);
      }

      return user;
    } catch (error) {
      console.error(`Failed to fetch user profile for ${login}:`, error);
      throw error;
    }
  }

  /**
   * Fetch raw user projects data from 42 API (for enhanced sync)
   */
  public async fetchRawUserProjects(login: string): Promise<Api42ProjectUser[]> {
    await this.ensureAuthenticated();

    try {
      const response: AxiosResponse<Api42ProjectUser[]> = await this.axiosInstance.get(
        `/v2/users/${login}/projects_users`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch raw projects for user ${login}:`, error);
      throw error;
    }
  }

  /**
   * Fetch user projects from 42 API
   */
  public async fetchUserProjects(login: string): Promise<Project[]> {
    await this.ensureAuthenticated();

    try {
      const response: AxiosResponse<Api42ProjectUser[]> = await this.axiosInstance.get(
        `/v2/users/${login}/projects_users`
      );
      const api42Projects = response.data;

      const projects: Project[] = [];

      // Process each project
      for (const projectUser of api42Projects) {
        try {
          // Only process active/ongoing projects
          if (projectUser.status === 'finished' || projectUser.status === 'parent') {
            continue;
          }

          const projectData = this.mapApi42ProjectToProject(projectUser);

          // Create project in database (this will handle duplicates via name constraint if added)
          const project = await createProjectCached(projectData);
          projects.push(project);

          console.log(`Synced project ${project.name} for user ${login}`);
        } catch (error) {
          console.error(`Failed to sync project ${projectUser.project.name}:`, error);
          // Continue with other projects even if one fails
        }
      }

      console.log(`Synced ${projects.length} projects for user ${login}`);
      return projects;
    } catch (error) {
      console.error(`Failed to fetch projects for user ${login}:`, error);
      throw error;
    }
  }

  /**
   * Sync user data (profile + projects) from 42 API
   */
  public async syncUserData(login: string): Promise<{ user: User; projects: Project[] }> {
    console.log(`Starting sync for user ${login}`);

    try {
      // Fetch user profile and projects in parallel
      const [user, projects] = await Promise.all([
        this.fetchUserProfile(login),
        this.fetchUserProjects(login)
      ]);

      console.log(`Successfully synced data for user ${login}`);
      return { user, projects };
    } catch (error) {
      console.error(`Failed to sync user data for ${login}:`, error);
      throw error;
    }
  }

  /**
   * Check if API is properly configured
   */
  public isConfigured(): boolean {
    return !!(process.env.API_UID && process.env.API_SECRET);
  }

  /**
   * Get current authentication status
   */
  public isAuthenticated(): boolean {
    return !!(this.token && Date.now() < this.tokenExpiresAt);
  }

  // Fetch active campus locations with pagination
  private async fetchActiveLocations(campusId: number): Promise<Api42Location[]> {
    await this.ensureAuthenticated();

    const all: Api42Location[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const resp: AxiosResponse<Api42Location[]> = await this.axiosInstance.get(
        `/v2/campus/${campusId}/locations`,
        {
          params: {
            'filter[active]': true,
            per_page: perPage,
            page,
          },
        }
      );

      const batch = resp.data || [];
      all.push(...batch);

      if (batch.length < perPage) break; // last page
      page += 1;
    }

    return all;
  }

  // Public: get active peers with 60s caching and stale fallback on errors
  public async getActivePeers(campusId: number): Promise<{ count: number; peers: Array<{ id: number; login: string; host: string; begin_at: string; avatar?: string }> }> {
    const cacheKey = PEERS_CACHE_KEY(campusId);

    // Fast path: cached list for fallback
    const cached = await getCache<{ count: number; peers: Array<{ id: number; login: string; host: string; begin_at: string; avatar?: string }> }>(cacheKey);

    try {
      const locations = await this.fetchActiveLocations(campusId);
      const basePeers = locations
        .filter((loc) => !!loc.user?.login && !!loc.host && !!loc.begin_at)
        .map((loc) => ({
          login: loc.user.login,
          host: loc.host,
          begin_at: new Date(loc.begin_at).toISOString(),
        }));

      // Enrich with DB id and avatar
      const peers = await Promise.all(
        basePeers.map(async (p) => {
          // Ensure user exists in DB and get id
          let dbUser = await getUserByLoginCached(p.login);
          if (!dbUser) {
            try {
              dbUser = await this.fetchUserProfile(p.login);
            } catch (e) {
              // ignore; will return id 0
            }
          }
          const id = dbUser?.id ?? 0;

          // Avatar from cache or API
          let avatar = await getCache<string>(AVATAR_CACHE_KEY(p.login));
          if (!avatar) {
            try {
              const uResp: AxiosResponse<any> = await this.axiosInstance.get(`/v2/users/${p.login}`);
              avatar = uResp.data?.image?.link || undefined;
              if (avatar) await setCache(AVATAR_CACHE_KEY(p.login), avatar, 6 * 60 * 60); // 6h TTL
            } catch (_) {
              // ignore avatar failures
            }
          }

          const normalizedAvatar = avatar || undefined;
          return { id, avatar: normalizedAvatar, ...p };
        })
      );

      const payload = { count: peers.length, peers };

      // Cache for ~60 seconds
      await setCache(cacheKey, payload, 60);

      return payload;
    } catch (error) {
      if (cached) {
        return { ...(cached as any), stale: true } as any;
      }
      throw error;
    }
  }

  /**
   * Resolve campus ID by name or numeric input and cache for 24h
   */
  public async resolveCampusId(campus: string): Promise<number> {
    // Numeric ID passed
    const maybeId = parseInt(campus, 10);
    if (Number.isFinite(maybeId)) return maybeId;

    const slug = (campus || '').toLowerCase().trim();
    if (!slug) throw new Error('Campus is required');

    const cacheKey = `42api:campus:id:${slug}`;
    const cached = await getCache<number>(cacheKey);
    if (cached) return cached;

    await this.ensureAuthenticated();

    const perPage = 100;
    let page = 1;
    let found: Api42Campus | undefined;

    while (!found) {
      const resp: AxiosResponse<Api42Campus[]> = await this.axiosInstance.get('/v2/campus', {
        params: { 'filter[active]': true, per_page: perPage, page },
      });
      const campuses = resp.data || [];
      found = campuses.find((c) =>
        c.name?.toLowerCase().includes(slug) || c.city?.toLowerCase().includes(slug)
      );
      if (found || campuses.length < perPage) break;
      page += 1;
    }

    if (!found) throw new Error(`Campus "${campus}" not found`);

    // Cache for 24 hours
    await setCache(cacheKey, found.id, 24 * 60 * 60);
    return found.id;
  }
}

// Export singleton instance
export const api42Service = new Api42Service();

// Export wrappers to preserve `this` binding
export const fetchUserProfile = (login: string) => api42Service.fetchUserProfile(login);
export const fetchUserProjects = (login: string) => api42Service.fetchUserProjects(login);
export const fetchRawUserProjects = (login: string) => api42Service.fetchRawUserProjects(login);
export const syncUserData = (login: string) => api42Service.syncUserData(login);
export const isConfigured = () => api42Service.isConfigured();
export const isAuthenticated = () => api42Service.isAuthenticated();
