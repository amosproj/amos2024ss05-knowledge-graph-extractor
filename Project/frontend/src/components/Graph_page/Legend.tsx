import React from 'react';
import { Box } from '@mui/material';

type ITopicColourMap = Record<string, string>;

const Legend: React.FC<{ topicColorMap: ITopicColourMap }> = ({
  topicColorMap,
}) => {
  return (
    <Box
      sx={{
        padding: '16px',
        backgroundColor: '#121826',
        borderRadius: '10px',
        color: 'white',
        maxHeight: '250px',
        overflowY: 'auto',
        // maxWidth: '300px',
        position: 'absolute',
        left: '16px',
        top: '16px',
        zIndex: 1300,
      }}
    >
      <Box component="ul" sx={{ padding: 0, margin: 0, listStyle: 'none' }}>
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
                // maxWidth: '250px',
                overflowWrap: 'break-word',
              }}
            >
              {topic.substring(topic.indexOf('_') + 1)}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Legend;
