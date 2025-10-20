const Calendar = () => {
  const mockEvents = [
    {
      id: 1,
      title: "Team Meeting",
      date: "2024-01-15",
      time: "10:00 AM",
      description: "Weekly team sync meeting"
    },
    {
      id: 2,
      title: "Project Review",
      date: "2024-01-16",
      time: "2:00 PM",
      description: "Review progress on Project Alpha"
    },
    {
      id: 3,
      title: "Client Presentation",
      date: "2024-01-18",
      time: "11:00 AM",
      description: "Present latest features to client"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-2">Schedule and manage your events</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Upcoming Events</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {mockEvents.map((event) => (
            <div key={event.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-sm font-medium text-gray-900">{event.date}</div>
                  <div className="text-sm text-gray-600">{event.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 bg-gray-50 text-center">
          <p className="text-gray-500 text-sm">Calendar integration coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Calendar;