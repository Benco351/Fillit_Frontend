import { Map, DateRange, CheckCircleSharp, Chat, SwapHoriz, Psychology, Notifications } from '@mui/icons-material';
import {
  Box, Card, CardContent, Container,
  Grid,
  Typography,
} from '@mui/material';


// Feature data
const features = [
  {
    icon: <DateRange fontSize="large" color="primary" />,
    title: "Smart Calendar",
    description: "View and manage shifts with our interactive calendar that displays dates, hours and statuses."
  },
  // {
  //   icon: <CheckCircleSharp fontSize="large" color="primary" />,
  //   title: "ChatGPT Integration",
  //   description: "View and manage shifts with our interactive calendar that displays dates, hours, and employee assignments."
  // },
  
  {
    icon: <SwapHoriz fontSize="large" color="primary" />,
    title: "Easy Shift Switch",
    description: "Exchange shifts with colleagues easily with automated approval workflows."
  },
  {
    icon: <Psychology fontSize="large" color="primary" />,
    title: "AI Assistant",
    description: "Get intelligent scheduling recommendations and shift suggestions from our AI-powered assistant."
  },
  {
    icon: <Map fontSize="large" color="primary" />,
    title: "Location Mapping",
    description: "View and select shift locations with our integrated Google Maps feature."
  },
  {
    icon: <Notifications fontSize="large" color="primary" />,
    title: "Push Notifications",
    description: "Stay updated with instant alerts about schedule changes and shift reminders."
  },
  {
    icon: <Chat fontSize="large" color="primary" />,
    title: "Integrated Chat",
    description: "Communicate seamlessly with P2P and group chats for quick team coordination and updates."
  },
];

//////////

const Features = () => {

  return (
    <Container sx={{ py: { xs: 8, md: 12 } }} >
      <Box sx={{ textAlign: 'center', mb: 8 }} >
        <Typography
          variant="h2"
          gutterBottom
          sx={{
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 600
          }}
        >
          Powerful Features
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            maxWidth: '700px',
            mx: 'auto',
            fontWeight: 400,
          }}
        >
          Everything you need to manage shifts efficiently in one place
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {features.map((feature, index) => (

          <Card
            key={index}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              p: 2,
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ mb: 2 }}>{feature.icon}</Box>
              <Typography gutterBottom variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                {feature.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {feature.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Grid>
    </Container>

  );
}
export default Features;
