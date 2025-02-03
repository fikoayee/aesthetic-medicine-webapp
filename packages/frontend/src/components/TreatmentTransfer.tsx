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
    <Card>
      <List dense component="div" role="list">
        {treatments.map((treatment: Treatment) => {
          const labelId = `transfer-list-item-${treatment._id}-label`;

          return (
            <ListItem
              key={treatment._id}
              role="listitem"
              button
              onClick={handleToggle(treatment)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(treatment) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    'aria-labelledby': labelId,
                  }}
                />
              </ListItemIcon>
              <ListItemIcon>
                <TreatmentIcon />
              </ListItemIcon>
              <ListItemText
                id={labelId}
                primary={treatment.name}
                secondary={`${treatment.duration} min • ${treatment.price} PLN`}
              />
            </ListItem>
          );
        })}
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
            <Typography variant="subtitle2" color="textSecondary">
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
            <Typography variant="subtitle2" color="textSecondary">
              Assigned Treatments
            </Typography>
            {customList(targetTreatments)}
          </Box>
        )}
      </Grid>
    </Grid>
  );
}
