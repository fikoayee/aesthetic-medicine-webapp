import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  Checkbox,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { MedicalServices as TreatmentIcon } from '@mui/icons-material';
import { Specialization } from '../services/specializationService';
import { Treatment } from '../services/treatmentService';

interface TreatmentTransferProps {
  specializations: Specialization[];
  onTransferTreatments: (fromSpecId: string, toSpecId: string, treatmentIds: string[]) => Promise<void>;
}

function not(a: Treatment[], b: Treatment[]): Treatment[] {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a: Treatment[], b: Treatment[]): Treatment[] {
  return a.filter((value) => b.indexOf(value) !== -1);
}

export default function TreatmentTransfer({ specializations, onTransferTreatments }: TreatmentTransferProps) {
  const [sourceSpecId, setSourceSpecId] = useState<string>('');
  const [targetSpecId, setTargetSpecId] = useState<string>('');
  const [checked, setChecked] = useState<Treatment[]>([]);
  const [sourceTreatments, setSourceTreatments] = useState<Treatment[]>([]);
  const [targetTreatments, setTargetTreatments] = useState<Treatment[]>([]);

  useEffect(() => {
    if (sourceSpecId) {
      const spec = specializations.find(s => s._id === sourceSpecId);
      setSourceTreatments(spec?.treatments || []);
    } else {
      setSourceTreatments([]);
    }
  }, [sourceSpecId, specializations]);

  useEffect(() => {
    if (targetSpecId) {
      const spec = specializations.find(s => s._id === targetSpecId);
      setTargetTreatments(spec?.treatments || []);
    } else {
      setTargetTreatments([]);
    }
  }, [targetSpecId, specializations]);

  const leftChecked = intersection(checked, sourceTreatments);
  const rightChecked = intersection(checked, targetTreatments);

  const handleToggle = (treatment: Treatment) => () => {
    const currentIndex = checked.indexOf(treatment);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(treatment);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleAllRight = () => {
    if (sourceSpecId && targetSpecId) {
      onTransferTreatments(sourceSpecId, targetSpecId, sourceTreatments.map(t => t._id));
    }
  };

  const handleCheckedRight = () => {
    if (sourceSpecId && targetSpecId) {
      onTransferTreatments(sourceSpecId, targetSpecId, leftChecked.map(t => t._id));
    }
  };

  const handleCheckedLeft = () => {
    if (sourceSpecId && targetSpecId) {
      onTransferTreatments(targetSpecId, sourceSpecId, rightChecked.map(t => t._id));
    }
  };

  const handleAllLeft = () => {
    if (sourceSpecId && targetSpecId) {
      onTransferTreatments(targetSpecId, sourceSpecId, targetTreatments.map(t => t._id));
    }
  };

  const customList = (treatments: Treatment[]) => (
    <Card sx={{
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)',
      bgcolor: '#ffffff',
      minHeight: '300px',
      maxHeight: '400px',
      overflow: 'auto',
    }}>
      <List dense component="div" role="list" sx={{ p: 0 }}>
        {treatments.map((treatment: Treatment) => {
          const labelId = `transfer-list-item-${treatment._id}-label`;

          return (
            <ListItem
              key={treatment._id}
              role="listitem"
              button
              onClick={handleToggle(treatment)}
              sx={{
                '&:hover': {
                  bgcolor: '#f3f6fb',
                },
                borderBottom: '1px solid rgba(130, 168, 234, 0.2)',
              }}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(treatment) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    'aria-labelledby': labelId,
                  }}
                  sx={{
                    color: '#306ad0',
                    '&.Mui-checked': {
                      color: '#306ad0',
                    },
                  }}
                />
              </ListItemIcon>
              <ListItemIcon>
                <TreatmentIcon sx={{ color: '#306ad0' }} />
              </ListItemIcon>
              <ListItemText
                id={labelId}
                primary={
                  <Typography sx={{ fontWeight: 500, color: '#04070b' }}>
                    {treatment.name}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Box
                      component="span"
                      sx={{
                        bgcolor: '#dddbff',
                        color: '#040316',
                        px: 1,
                        py: 0.5,
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                      }}
                    >
                      {treatment.duration} min
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        bgcolor: '#dddbff',
                        color: '#040316',
                        px: 1,
                        py: 0.5,
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                      }}
                    >
                      {treatment.price} PLN
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          );
        })}
        {treatments.length === 0 && (
          <ListItem sx={{ justifyContent: 'center', py: 3 }}>
            <Typography sx={{ color: '#04070b', opacity: 0.7 }}>
              No treatments available
            </Typography>
          </ListItem>
        )}
      </List>
    </Card>
  );

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center">
      <Grid item xs={12} md={5}>
        <FormControl fullWidth>
          <InputLabel>Source Specialization</InputLabel>
          <Select
            value={sourceSpecId}
            label="Source Specialization"
            onChange={(e) => setSourceSpecId(e.target.value)}
            sx={{
              bgcolor: '#ffffff',
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(130, 168, 234, 0.5)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#306ad0',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#306ad0',
              },
            }}
          >
            {specializations.map((spec) => (
              <MenuItem key={spec._id} value={spec._id}>
                {spec.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {sourceSpecId && (
          <Box mt={2}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1,
                color: '#04070b',
                fontWeight: 500,
              }}
            >
              Available Treatments
            </Typography>
            {customList(sourceTreatments)}
          </Box>
        )}
      </Grid>
      <Grid item xs={12} md={2}>
        <Grid container direction="column" alignItems="center" spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              size="small"
              onClick={handleAllRight}
              disabled={sourceTreatments.length === 0 || !sourceSpecId || !targetSpecId}
              aria-label="move all right"
              sx={{
                borderColor: '#306ad0',
                color: '#306ad0',
                '&:hover': {
                  borderColor: '#5d91ed',
                  bgcolor: 'rgba(48, 106, 208, 0.04)',
                },
                '&.Mui-disabled': {
                  borderColor: 'rgba(48, 106, 208, 0.2)',
                },
                minWidth: '40px',
              }}
            >
              ≫
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCheckedRight}
              disabled={leftChecked.length === 0 || !sourceSpecId || !targetSpecId}
              aria-label="move selected right"
              sx={{
                borderColor: '#306ad0',
                color: '#306ad0',
                '&:hover': {
                  borderColor: '#5d91ed',
                  bgcolor: 'rgba(48, 106, 208, 0.04)',
                },
                '&.Mui-disabled': {
                  borderColor: 'rgba(48, 106, 208, 0.2)',
                },
                minWidth: '40px',
              }}
            >
              &gt;
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCheckedLeft}
              disabled={rightChecked.length === 0 || !sourceSpecId || !targetSpecId}
              aria-label="move selected left"
              sx={{
                borderColor: '#306ad0',
                color: '#306ad0',
                '&:hover': {
                  borderColor: '#5d91ed',
                  bgcolor: 'rgba(48, 106, 208, 0.04)',
                },
                '&.Mui-disabled': {
                  borderColor: 'rgba(48, 106, 208, 0.2)',
                },
                minWidth: '40px',
              }}
            >
              &lt;
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              size="small"
              onClick={handleAllLeft}
              disabled={targetTreatments.length === 0 || !sourceSpecId || !targetSpecId}
              aria-label="move all left"
              sx={{
                borderColor: '#306ad0',
                color: '#306ad0',
                '&:hover': {
                  borderColor: '#5d91ed',
                  bgcolor: 'rgba(48, 106, 208, 0.04)',
                },
                '&.Mui-disabled': {
                  borderColor: 'rgba(48, 106, 208, 0.2)',
                },
                minWidth: '40px',
              }}
            >
              ≪
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={5}>
        <FormControl fullWidth>
          <InputLabel>Target Specialization</InputLabel>
          <Select
            value={targetSpecId}
            label="Target Specialization"
            onChange={(e) => setTargetSpecId(e.target.value)}
            sx={{
              bgcolor: '#ffffff',
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(130, 168, 234, 0.5)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#306ad0',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#306ad0',
              },
            }}
          >
            {specializations.map((spec) => (
              <MenuItem key={spec._id} value={spec._id}>
                {spec.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {targetSpecId && (
          <Box mt={2}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1,
                color: '#04070b',
                fontWeight: 500,
              }}
            >
              Assigned Treatments
            </Typography>
            {customList(targetTreatments)}
          </Box>
        )}
      </Grid>
    </Grid>
  );
}
