export const initialPhysicsOptions = {
  gravitationalConstant: -20000,
  springLength: 100,
  springConstant: 0.1,
  damping: 0.09,
  levelSeparation: 150,
  nodeSpacing: 100,
  treeSpacing: 200,
  blockShifting: true,
  edgeMinimization: true,
  parentCentralization: true,
  direction: 'UD',
  sortMethod: 'hubsize',
  shakeTowards: 'leaves',
  iterations: 1000,
};

export const physicsOptionsByLayout = {
  barnesHut: {
    gravitationalConstant: -20000,
    springLength: 100,
    springConstant: 0.1,
    damping: 0.09,
  },
  forceAtlas2Based: {
    gravitationalConstant: -50,
    springLength: 100,
    springConstant: 0.08,
    damping: 0.4,
  },
  hierarchicalRepulsion: {
    gravitationalConstant: 0,
    springLength: 120,
    springConstant: 0,
    damping: 0,
  },
  repulsion: {
    gravitationalConstant: 0.2,
    springLength: 200,
    springConstant: 0.05,
    damping: 0.09,
  },
  hierarchical: {
    levelSeparation: 150,
    nodeSpacing: 100,
    treeSpacing: 200,
    blockShifting: true,
    edgeMinimization: true,
    parentCentralization: true,
    direction: 'UD',
    sortMethod: 'hubsize',
    shakeTowards: 'leaves',
  },
};

export const leftDrawerWidth = 450;
export const rightDrawerWidth = 300;

export const getOptions = (layout: string, physicsOptions: any) => ({
  nodes: {
    shape: 'dot',
    size: 25,
    font: {
      size: 18,
      color: '#ffffff',
    },
  },
  edges: {
    width: 2,
    color: '#ffffff',
    arrows: {
      to: { enabled: true, scaleFactor: 0.5 },
    },
    font: {
      size: 14,
      color: '#ffffff',
      strokeWidth: 3,
      strokeColor: '#000000',
    },
  },
  interaction: {
    hover: true,
    tooltipDelay: 30,
    zoomView: true,
    dragView: true,
    selectConnectedEdges: false,
  },
  physics: {
    enabled: true,
    barnesHut: layout === 'barnesHut' ? physicsOptions : {},
    forceAtlas2Based: layout === 'forceAtlas2Based' ? physicsOptions : {},
    hierarchicalRepulsion:
      layout === 'hierarchicalRepulsion'
        ? { nodeDistance: physicsOptions.springLength }
        : {},
    repulsion:
      layout === 'repulsion'
        ? {
            nodeDistance: physicsOptions.springLength,
            centralGravity: physicsOptions.gravitationalConstant,
            springLength: physicsOptions.springLength,
            springConstant: physicsOptions.springConstant,
            damping: physicsOptions.damping,
          }
        : {},
    solver: layout,
    stabilization: {
      iterations: physicsOptions.iterations,
    },
  },
  layout:
    layout === 'hierarchical'
      ? {
          hierarchical: {
            direction: physicsOptions.direction,
            sortMethod: physicsOptions.sortMethod,
            levelSeparation: physicsOptions.levelSeparation,
            nodeSpacing: physicsOptions.nodeSpacing,
            treeSpacing: physicsOptions.treeSpacing,
            blockShifting: physicsOptions.blockShifting,
            edgeMinimization: physicsOptions.edgeMinimization,
            parentCentralization: physicsOptions.parentCentralization,
            shakeTowards: physicsOptions.shakeTowards,
            improvedLayout: false,
          },
        }
      : {},
});
