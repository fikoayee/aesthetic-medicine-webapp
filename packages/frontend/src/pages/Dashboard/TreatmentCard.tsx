import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, alpha } from '@mui/material';
import { Spa as SpaIcon } from '@mui/icons-material';

interface Treatment {
  name: string;
  count: number;
}

interface TreatmentCardProps {
  treatments: Treatment[];
}

const TreatmentCard: React.FC<TreatmentCardProps> = ({ treatments }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SpaIcon />
        Popular Treatments
      </Typography>
      {treatments.map((treatment, index) => (
        <Box key={treatment.name} sx={{ mb: index !== treatments.length - 1 ? 2 : 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">{treatment.name}</Typography>
            <Typography variant="body2" color="primary">{treatment.count} appointments</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(treatment.count / Math.max(...treatments.map(t => t.count))) * 100}
            sx={{ 
              height: 6, 
              borderRadius: 3,
              bgcolor: alpha('#306ad0', 0.1),
              '& .MuiLinearProgress-bar': {
                bgcolor: '#306ad0',
                borderRadius: 3,
              }
            }}
          />
        </Box>
      ))}
    </CardContent>
  </Card>
);

export default TreatmentCard;
