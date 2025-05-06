import { Box, Button, Container, Typography, Stack, Grid } from '@mui/material';

const Header = () => {
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
                            {/* <Button
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
                            </Button> */}

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
                <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    overflow: 'hidden',
                    lineHeight: 0,
                    transform: 'rotate(180deg)',
                    zIndex: 0,
                }}
                >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                    style={{
                    position: 'relative',
                    display: 'block',
                    width: 'calc(100% + 1.3px)',
                    height: '80px',
                    }}
                >
                    <path
                    d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                    fill="rgba(245, 245, 245)"
                    />
                </svg>
                </Box>
            </Box>
        </>
    )
}
export default Header;