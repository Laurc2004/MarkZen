# Contributing to MarkZen

First off, thank you for considering contributing to MarkZen! 🎉

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Rust 1.70+
- Git

### Setup Development Environment

```bash
# 1. Fork and clone the repository
git clone git@github.com:Laurc2004/MarkZen.git
cd MarkZen

# 2. Install dependencies
npm install

# 3. Start development
npm run tauri dev
```

## 🐛 Bug Reports

Before creating bug reports, please check the [existing issues](https://github.com/Laurc2004/MarkZen/issues) to avoid duplicates.

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows 11, macOS 14, Ubuntu 22.04]
 - MarkZen Version: [e.g. 0.1.0]
 - Node.js Version: [e.g. 18.17.0]

**Additional context**
Add any other context about the problem here.
```

## 💡 Feature Requests

We welcome feature suggestions! Please provide:

1. **Clear description** of the feature
2. **Use case** explaining why it's needed
3. **Possible implementation** if you have ideas

## 🔧 Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **React**: Use functional components with hooks
- **Styling**: Tailwind CSS + Sass for custom styles
- **State Management**: Zustand for global state

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(editor): add syntax highlighting for code blocks
fix(preview): resolve math formula rendering issue
docs(readme): update installation instructions
style(ui): improve button hover effects
refactor(state): simplify file management logic
```

### Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation
- `refactor/component-name` - Code refactoring

## 🚀 Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch from `main`
3. **Make** your changes following our guidelines
4. **Test** your changes thoroughly
5. **Commit** using conventional commit messages
6. **Push** to your fork
7. **Create** a Pull Request

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on Windows
- [ ] Tested on macOS
- [ ] Tested on Linux

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] No new warnings or errors
- [ ] Documentation updated (if needed)
```

## 🧪 Testing

### Manual Testing
```bash
# Development mode
npm run tauri dev

# Build test
npm run tauri build

# Frontend only
npm run dev
```

### Areas to Test
- File operations (open, save, create)
- Editor functionality (typing, scrolling)
- Preview rendering (markdown, math, diagrams)
- Theme switching
- Cross-platform compatibility

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── editor/         # Editor related components
│   ├── layout/         # Layout components
│   ├── preview/        # Preview components
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── stores/             # Zustand stores
├── styles/             # Sass stylesheets
├── types/              # TypeScript type definitions
└── utils/              # Utility functions

src-tauri/
├── src/                # Rust backend code
├── icons/              # Application icons
└── Cargo.toml          # Rust dependencies
```

## 🎯 Development Priorities

### High Priority
- Performance optimization
- Cross-platform compatibility
- Core editing features
- File management

### Medium Priority
- Advanced export features
- Plugin system
- Theme customization
- Accessibility improvements

### Low Priority
- Cloud integration
- Collaboration features
- Mobile companion app

## ❓ Questions?

- Join our [Discussions](https://github.com/Laurc2004/MarkZen/discussions)
- Check the [Wiki](https://github.com/Laurc2004/MarkZen/wiki)
- Open an [Issue](https://github.com/Laurc2004/MarkZen/issues)

## 🙏 Recognition

Contributors will be recognized in:
- README contributors section
- Release notes
- In-app credits

Thank you for contributing to MarkZen! 🚀