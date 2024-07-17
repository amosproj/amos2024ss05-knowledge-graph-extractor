import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type ITopicColourMap = Record<string, string>;

const Legend: React.FC<{ topicColorMap: ITopicColourMap }> = ({
  topicColorMap,
}) => {
  return (
    <Box
      sx={{
        borderRadius: '10px',
        color: 'white',
        overflowY: 'auto',
        maxWidth: '350px',
        position: 'absolute',
        left: '16px',
        top: '16px',
        zIndex: 1300,
      }}
    >
      <Accordion
        sx={{
          backgroundColor: '#0d1117',
          color: 'white',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon style={{ color: '#fff' }} />}
        >
          <Typography>Topic / Color Legend</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box
            sx={{
              maxHeight: '250px',
              overflowY: 'auto',
            }}
          >
            <Box component="ul">
              {Object.entries(topicColorMap).map(([topic, color]) => (
                <Box
                  component="li"
                  key={topic}
                  sx={{
                    display: 'flex',
                    marginBottom: '8px',
                  }}
                >
                  <Box
                    sx={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: color,
                      marginRight: '8px',
                      flexShrink: 0,
                    }}
                  />
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.875rem',
                      wordWrap: 'break-word',
                      whiteSpace: 'normal',
                      overflowWrap: 'break-word',
                    }}
                  >
                    {topic.substring(topic.indexOf('_') + 1)}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default Legend;
