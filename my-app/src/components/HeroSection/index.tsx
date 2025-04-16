import { Box, Button, Container, Typography, Stack, Grid } from '@mui/material';
import HeroWave from '../HeroWave';

const HeroSection = () => {
    return (
        <>
            <Box
                sx={{
                    position: 'relative',
                    bgcolor: 'secondary.main',
                    color: 'white',
                    overflow: 'hidden',
                    pt: { xs: 20, md: 25 },
                    pb: { xs: 15, md: 20 },
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Typography
                            variant="h1"
                            gutterBottom
                            sx={{
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                                lineHeight: 1.2,
                                mb: 3,
                            }}
                        >
                            Simplify Your <Typography component="span" color="primary" variant="inherit">Shift Management</Typography>
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 4,
                                fontWeight: 400,
                                opacity: 0.9,
                                maxWidth: '600px',
                            }}
                        >
                            Streamline scheduling, enhance communication, and automate shift-matching with our intelligent cloud-based platform.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                sx={{
                                    py: 1.5,
                                    px: 4,
                                    fontWeight: 600
                                }}
                            >
                                Get Started Free
                            </Button>

                        </Stack>

                        <Box
                            component="img"
                            src="/fillit.png"
                            alt="Fillit App Dashboard"
                            sx={{
                                width: '40%',
                                maxWidth: '600px',
                                borderRadius: 3,
                                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                                transform: 'perspective(1000px) rotateY(-10deg) rotateX(5deg)',
                                border: '8px solid rgba(255,255,255,0.1)',
                            }}
                        />
                    </Grid>
                </Container>
                <HeroWave />
            </Box>
        </>
    )
}
export default HeroSection;