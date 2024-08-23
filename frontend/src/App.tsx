import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Drawer, List, ListItem, ListItemText, TextField, Typography, CircularProgress, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import CodeIcon from '@mui/icons-material/Code';
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

const highlightSyntax = (code, language) => {
  let highlighted = code;
  const patterns = {
    html: {
      tag: /(&lt;\/?[\w\s="/.'-]+&gt;)/g,
      attribute: /\s(\w+)=/g,
      string: /(".+?")/g,
    },
    css: {
      selector: /([\w-]+\s*{)/g,
      property: /(\w+\s*:)/g,
      value: /:\s*([^;]+);/g,
    },
    javascript: {
      keyword: /\b(const|let|var|function|return|if|for|while|else)\b/g,
      string: /(".+?")|('.+?')/g,
      number: /\b(\d+)\b/g,
      function: /\b(\w+)\(/g,
      comment: /(\/\/.*$)/gm,
    },
  };

  if (patterns[language]) {
    Object.entries(patterns[language]).forEach(([className, regex]) => {
      highlighted = highlighted.replace(regex, `<span class="${className}">$1</span>`);
    });
  }

  return highlighted;
};

const CodeBlock = ({ content, language, onChange }) => (
  <Box sx={{ mb: 1 }}>
    <Select
      value={language || ''}
      onChange={(e) => onChange(content, e.target.value)}
      sx={{ mb: 1 }}
    >
      <MenuItem value="">Select language</MenuItem>
      <MenuItem value="html">HTML</MenuItem>
      <MenuItem value="css">CSS</MenuItem>
      <MenuItem value="javascript">JavaScript</MenuItem>
    </Select>
    <TextField
      fullWidth
      multiline
      variant="outlined"
      value={content}
      onChange={(e) => onChange(e.target.value, language)}
      InputProps={{
        style: {
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
        },
      }}
    />
    <Box
      className="code-block"
      dangerouslySetInnerHTML={{ __html: highlightSyntax(content, language) }}
      sx={{ mt: 1 }}
    />
  </Box>
);

const App = () => {
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([{ type_: 'text', content: '', language: null }]);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const result = await backend.getPages();
      setPages(result || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const createPage = async () => {
    setLoading(true);
    try {
      const newPageId = await backend.createPage('New Page');
      await fetchPages();
      setCurrentPage(newPageId);
      setTitle('New Page');
      setBlocks([{ type_: 'text', content: '', language: null }]);
    } catch (error) {
      console.error('Error creating page:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPage = async (id) => {
    setLoading(true);
    try {
      const page = await backend.getPage(id);
      if (page) {
        setCurrentPage(id);
        setTitle(page.title);
        setBlocks(page.blocks || []);
      }
    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePage = async () => {
    if (currentPage === null) return;
    setLoading(true);
    try {
      await backend.updatePage(currentPage, title, blocks);
      await fetchPages();
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockChange = (index, content, language = null) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], content, language };
    setBlocks(newBlocks);
  };

  const addBlock = (type_ = 'text') => {
    setBlocks([...blocks, { type_, content: '', language: null }]);
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
          {loading ? (
            <CircularProgress />
          ) : (
            Array.isArray(pages) && pages.map((page) => (
              <ListItem button key={page.id} onClick={() => loadPage(page.id)}>
                <ListItemText primary={page.title} />
              </ListItem>
            ))
          )}
        </List>
      </Drawer>
      <Main open={drawerOpen}>
        <Container>
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <TextField
                fullWidth
                variant="standard"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ mb: 2, fontSize: '2rem', fontWeight: 'bold' }}
              />
              {Array.isArray(blocks) && blocks.map((block, index) => (
                block.type_ === 'code' ? (
                  <CodeBlock
                    key={index}
                    content={block.content}
                    language={block.language}
                    onChange={(content, language) => handleBlockChange(index, content, language)}
                  />
                ) : (
                  <TextField
                    key={index}
                    fullWidth
                    multiline
                    variant="standard"
                    value={block.content}
                    onChange={(e) => handleBlockChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleBlockChange(index, block.content + '\n');
                      }
                    }}
                    sx={{ mb: 1 }}
                  />
                )
              ))}
              <Button onClick={() => addBlock('text')}>Add Text Block</Button>
              <Button onClick={() => addBlock('code')} startIcon={<CodeIcon />}>Add Code Block</Button>
              <Button onClick={savePage}>Save</Button>
            </>
          )}
        </Container>
      </Main>
    </Box>
  );
};

export default App;
