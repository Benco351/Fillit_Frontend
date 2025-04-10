import { alpha, Box, Container, Divider, Stack, Typography } from '@mui/material'
import React from 'react'

const Footer = () => {
  return (
      <Box sx={{ bgcolor: 'secondary.main', color: 'white', py: 6 }}>
      <Container>
        {/* Top Section - Logo & Links */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 4,
          }}
        >
          {/* Branding */}
          <Box sx={{ flex: '1 1 250px', minWidth: 200 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mb: 2 }}
            >
              f
              <Typography component="span" color="primary" variant="h4" sx={{ fontWeight: 700 }}>i</Typography>
              ll
              <Typography component="span" color="primary" variant="h4" sx={{ fontWeight: 700 }}>i</Typography>
              t
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.7 }}>
              The intelligent shift management platform that streamlines scheduling and enhances team communication.
            </Typography>
          </Box>

          {/* Link Sections */}
          {[
            /*{ title: 'Product', links: ['Features', 'Integrations', 'FAQ'] },*/
            /*{ title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Contact'] },*/
            /*{ title: 'Resources', links: ['Documentation', 'Support', 'API', 'Community'] },*/
            { title: ' ', links: [' ', ' ', ' '] },
          ].map((section, idx) => (
            <Box key={idx} sx={{ minWidth: 150 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                {section.title}
              </Typography>
              <Stack spacing={1}>
                {section.links.map((link, i) => (
                  <Typography key={i} variant="body2" sx={{ opacity: 0.7 }}>
                    {link}
                  </Typography>
                ))}
              </Stack>
            </Box>
          ))}
        </Box> 
        
        {/* Divider and Bottom Note */}
        <Divider sx={{ my: 4, borderColor: alpha('#ffffff', 0.1) }} />
        <Typography variant="body2" align="center" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} Fillit. All rights reserved.
        </Typography>
      </Container>
    </Box>
  )
}

export default Footer