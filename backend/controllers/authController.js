const fs = require('fs');
const path = require('path');

const getUsers = () => {
  const usersPath = path.join(__dirname, '../data/users.json');
  const usersData = fs.readFileSync(usersPath, 'utf8');
  return JSON.parse(usersData);
};

const login = (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt:', { 
      username, 
      password: password ? '***' : 'undefined',
      origin: req.headers.origin,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress
    });

    if (!username || !password) {
      console.log('Missing credentials:', { username: !!username, password: !!password });
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    const users = getUsers();
    console.log('Available users:', users.map(u => ({ username: u.username, role: u.role })));
    
    const user = users.find(u => u.username === username && u.password === password);
    console.log('User found:', !!user);

    if (!user) {
      console.log('Invalid credentials for username:', username);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    console.log('Login successful for user:', user.username);

    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token: `mock-token-${user.id}-${Date.now()}`
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
};

module.exports = {
  login,
  logout
};
