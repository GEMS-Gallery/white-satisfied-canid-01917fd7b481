import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Drawer, List, ListItem, ListItemText, TextField, Typography } from '@mui/material';
import { styled } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import { backend } from 'declarations/backend';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const App = () => {
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([{ type_: 'text', content: '' }]);
  const [drawerOpen, setDrawerOpen] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const result = await backend.getPages();
      setPages(result);
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
  };

  const createPage = async () => {
    try {
      const newPageId = await backend.createPage('New Page');
      await fetchPages();
      setCurrentPage(newPageId);
      setTitle('New Page');
      setBlocks([{ type_: 'text', content: '' }]);
    } catch (error) {
      console.error('Error creating page:', error);
    }
  };

  const loadPage = async (id) => {
    try {
      const page = await backend.getPage(id);
      if (page) {
        setCurrentPage(id);
        setTitle(page.title);
        setBlocks(page.blocks);
      }
    } catch (error) {
      console.error('Error loading page:', error);
    }
  };

  const savePage = async () => {
    if (currentPage === null) return;
    try {
      await backend.updatePage(currentPage, title, blocks);
      await fetchPages();
    } catch (error) {
      console.error('Error saving page:', error);
    }
  };

  const handleBlockChange = (index, content) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], content };
    setBlocks(newBlocks);
  };

  const addBlock = () => {
    setBlocks([...blocks, { type_: 'text', content: '' }]);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={drawerOpen}
      >
        <DrawerHeader>
          <Button startIcon={<AddIcon />} onClick={createPage}>
            Add Page
          </Button>
        </DrawerHeader>
        <List>
          {pages.map((page) => (
            <ListItem button key={page.id} onClick={() => loadPage(page.id)}>
              <ListItemText primary={page.title} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main open={drawerOpen}>
        <Container>
          <TextField
            fullWidth
            variant="standard"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2, fontSize: '2rem', fontWeight: 'bold' }}
          />
          {blocks.map((block, index) => (
            <TextField
              key={index}
              fullWidth
              multiline
              variant="standard"
              value={block.content}
              onChange={(e) => handleBlockChange(index, e.target.value)}
              sx={{ mb: 1 }}
            />
          ))}
          <Button onClick={addBlock}>Add Block</Button>
          <Button onClick={savePage}>Save</Button>
        </Container>
      </Main>
    </Box>
  );
};

export default App;
