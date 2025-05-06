import { alpha, Box, Container, Divider, Stack, Typography } from '@mui/material'
import React from 'react'
import Branding from '../../common/Branding'



const Footer = () => {
  return (
      <Box sx={{ bgcolor: 'secondary.main', color: 'white', py: 6 }}>
      <Container>
        {/* Top Section - Logo & Links */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: { xs: 'center', md: 'space-between' },
            alignItems: { xs: 'center', md: 'flex-start' },
            flexWrap: 'wrap',
            gap: 4,
          }}
        >
         
          {/* Logo Section */}
          <Branding/>
          {/* Link Sections
          {[
            { title: 'Product', links: ['Features', 'Integrations', 'FAQ'] },
            { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Contact'] },
            { title: 'Resources', links: ['Documentation', 'Support', 'API', 'Community'] }
          ]
          .map((section, idx) => (
            <Box
              key={idx}
              sx={{
                minWidth: 150,
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
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
          ))} */}
        </Box> 
        
        {/* Divider and Bottom Note */}
        <Divider sx={{ my: 4, borderColor: alpha('#ffffff', 0.1) }} />
        <Typography variant="body2" align="center" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} Licensed under the Apache License, Version 2.0.
        </Typography>
      </Container>
    </Box>
  )
}

export default Footer