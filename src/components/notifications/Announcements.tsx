import React from 'react';
import { Card, CardContent, Typography, Stack } from '@mui/material';

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

interface AnnouncementsProps {
  announcements: Announcement[];
}

const Announcements: React.FC<AnnouncementsProps> = ({ announcements }) => {
  const getPriorityColor = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'high':
        return 'error.main';
      case 'medium':
        return 'warning.main';
      case 'low':
        return 'info.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Announcements
        </Typography>
        <Stack spacing={2}>
          {announcements.map((announcement) => (
            <Card key={announcement.id} variant="outlined">
              <CardContent>
                <Typography variant="subtitle1">{announcement.title}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {announcement.content}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Date: {announcement.date}
                </Typography>
                <Typography
                  variant="body2"
                  color={getPriorityColor(announcement.priority)}
                  sx={{ mt: 0.5 }}
                >
                  Priority: {announcement.priority}
                </Typography>
              </CardContent>
            </Card>
          ))}
          {announcements.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No announcements
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default Announcements; 