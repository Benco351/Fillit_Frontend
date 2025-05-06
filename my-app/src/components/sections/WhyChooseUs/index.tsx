import { Check, ArrowForward } from '@mui/icons-material';
import {
  Box, Button, Container,
  Grid,
  Paper,
  Typography
} from '@mui/material';
import { alpha } from '@mui/system';
import { WhyChooseUsTheme } from '../../../assets/themes/themes';

const features = [
  {
    title: 'Inspired by Real Needs',
    description: 'Born from volunteer experience at Magen David Adom, we understand the challenges of shift management in non-profit organizations.',
  },
  {
    title: 'Cutting-Edge Technology',
    description: 'Built on AWS cloud infrastructure with AI-powered assistance for intelligent shift-matching and scheduling.',
  },
  {
    title: 'Customizable & Scalable',
    description: 'Adaptable organizational templates and scalable infrastructure to grow with your organization\'s needs.',
  },
];

const FeatureCard = ({ title, description }: { title: string, description: string }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      display: 'flex',
      alignItems: 'flex-start',
      bgcolor: alpha(WhyChooseUsTheme.palette.primary.main, 0.05),
      border: `1px solid ${alpha(WhyChooseUsTheme.palette.primary.main, 0.1)}`,
    }}
  >
    <Check color="primary" sx={{ mr: 2, mt: 0.5 }} />
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
  </Paper>
);

const WhyChooseUs = () => {
  return (
    <Box sx={{ bgcolor: 'grey.50', py: { xs: 8, md: 12 } }}>
      <Container>
        <Grid container spacing={6} alignItems="center">

          <Box
            component="img"
            src="/fillit.png"
            alt="Fillit App in Action"
            sx={{
              width: '10%',
              borderRadius: 3,
              boxShadow: WhyChooseUsTheme.shadows[10],
            }}
          />
          <Typography>
            Why Choose Fillit?
          </Typography>
          <Typography color="text.secondary">
            Our platform streamlines shift management like never before, addressing the challenges of disorganized communication and manual scheduling.
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            {features.map((feature, index) => (
               <FeatureCard key={index} title={feature.title} description={feature.description} />
             ))}
          </Grid>

          {/* <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<ArrowForward />}
            sx={{ mt: 4 }}
          >
            Learn More
          </Button> */}
        </Grid>
      </Container>
    </Box>

  );
}

export default WhyChooseUs;


