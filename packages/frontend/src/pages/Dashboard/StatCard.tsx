import React from 'react';
import { Card, CardContent, Typography, Box, IconButton, Tooltip, alpha } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { SvgIconComponent } from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: SvgIconComponent;
  color: string;
  subtitle?: string;
  tooltip?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle,
  tooltip
}) => (
  <Card sx={{ 
    height: '100%',
    background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: `radial-gradient(circle at 0% 0%, ${alpha('#fff', 0.1)} 0%, transparent 50%)`,
    },
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontSize: '1rem', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          {title}
          {tooltip && (
            <Tooltip title={tooltip} arrow>
              <IconButton size="small" sx={{ color: 'white', opacity: 0.8 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Typography>
        <Icon sx={{ fontSize: 40, opacity: 0.8 }} />
      </Box>
      <Typography variant="h4" sx={{ mb: subtitle ? 1 : 0 }}>
        {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default StatCard;
