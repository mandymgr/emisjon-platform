# Emisjon Design System
> **"Light foundation with strategic pops of life - minimal but alive"**

---

## 🎯 Core Philosophy

### Design DNA
- **Ultra-Minimal Foundation**: Light, clean, sophisticated base
- **Strategic Color Life**: Thoughtful color placement that adds meaning
- **Scandinavian Elegance**: Inspired by HAY, Muuto, &Tradition
- **Visual Truth**: Optisk balance over geometric perfection
- **Professional Sophistication**: Bloomberg-level credibility with human warmth

### The Golden Rule
> **"Every element must justify its existence. If removing it doesn't break anything, it shouldn't be there."**

---

## 🎨 Color System

### Foundation Colors (90% of interface)
```css
/* Backgrounds */
--bg-primary: #ffffff        /* bg-white */
--bg-secondary: #fafafa      /* bg-neutral-50 */
--bg-subtle: #f5f5f5        /* bg-neutral-100 */

/* Text Hierarchy */
--text-primary: #171717     /* text-neutral-900 */
--text-secondary: #525252   /* text-neutral-600 */
--text-tertiary: #737373    /* text-neutral-500 */
--text-subtle: #a3a3a3      /* text-neutral-400 */

/* Borders & Structure */
--border-default: #e5e5e5   /* border-neutral-200 */
--border-hover: #a3a3a3     /* border-neutral-400 */
```

### Life Colors (Strategic Use Only)
```css
/* Nordic Blue - Data & Analytics */
--nordic-blue-50: #f0f9ff   /* Subtle backgrounds */
--nordic-blue-400: #60a5fa  /* Progress bars, data highlights */
--nordic-blue-500: #3b82f6  /* Interactive elements */
--nordic-blue-600: #2563eb  /* Text accents */

/* Sage Green - Growth & Success */
--sage-50: #f0fdf4          /* Success background */
--sage-400: #4ade80         /* Positive indicators */
--sage-600: #16a34a         /* Positive text */

/* Warm Terracotta - Human Elements */
--terracotta-50: #fef7f3    /* Warm backgrounds */
--terracotta-400: #fb923c   /* Warm accents */
--terracotta-600: #ea580c   /* Warm text */
```

### Color Application Rules

#### ✅ DO Use Color For:
- **Progress indicators** (Nordic Blue)
- **Data highlights** (highest/lowest values)
- **Success states** (Sage Green)
- **Interactive feedback** (hover states)
- **Key call-to-actions** (max 1 per viewport)

#### ❌ NEVER Use Color For:
- **Backgrounds** (keep light foundation)
- **Body text** (use neutral hierarchy)
- **Decorative elements**
- **Multiple competing elements**

---

## 📐 Typography System

### Hierarchy
```css
/* Headlines - Ultra Light Drama */
h1: text-5xl font-extralight text-neutral-900 mb-3    /* 48px */
h2: text-3xl font-extralight text-neutral-900 mb-8    /* 30px */
h3: text-2xl font-extralight text-neutral-900 mb-6    /* 24px */

/* Body Text - Light & Readable */
body-large: text-lg font-light text-neutral-600       /* 18px */
body-base: text-base font-light text-neutral-900      /* 16px */
body-small: text-sm font-light text-neutral-700       /* 14px */

/* Data Display - Authority */
data-hero: text-4xl font-extralight text-neutral-900  /* 36px */
data-large: text-2xl font-extralight text-neutral-900 /* 24px */
data-base: text-lg font-light text-neutral-900        /* 18px */

/* Labels & Meta */
label: text-xs font-light text-neutral-500 uppercase tracking-wider /* 12px */
meta: text-xs font-light text-neutral-400             /* 12px */
```

### Typography Rules
- **NEVER**: font-bold, font-semibold, font-medium
- **ALWAYS**: font-extralight for impact, font-light for readability
- **Labels**: Always uppercase with wide tracking
- **Numbers**: Use toLocaleString() for formatting

---

## 🏗️ Layout System

### Spacing Scale
```css
/* Layout Spacing */
--space-section: 4rem        /* mb-16 between sections */
--space-component: 2rem      /* mb-8 between components */
--space-element: 1.5rem      /* mb-6 between elements */
--space-tight: 0.75rem       /* mb-3 for tight grouping */

/* Component Padding */
--padding-card: 2rem         /* p-8 for cards */
--padding-compact: 1.5rem    /* p-6 for compact areas */
--padding-loose: 3rem        /* p-12 for feature areas */
```

### Grid System
```css
/* Standard Grids */
stats-grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8
content-grid: grid-cols-1 lg:grid-cols-3 gap-8
compact-grid: grid-cols-2 md:grid-cols-4 gap-6
```

---

## 📊 Data Visualization Standards

### Chart Types & When to Use

#### Progress Bars (Primary Choice)
**Use for**: Share distribution, progress tracking, comparisons
```tsx
<div className="h-2 bg-neutral-100 overflow-hidden">
  <div
    className="h-full bg-nordic-blue-400 transition-all duration-1000 ease-out"
    style={{
      width: `${percentage}%`,
      transitionDelay: `${index * 200}ms`
    }}
  />
</div>
```

#### Simple Line Charts (Secondary)
**Use for**: Trends over time, performance tracking
- **Style**: Minimal, single color (Nordic Blue)
- **No**: Fancy gradients, multiple colors, complex legends

#### Data Tables (Always Available)
**Use for**: Detailed breakdowns, precise values
```tsx
<div className="space-y-4">
  {data.map((item) => (
    <div className="flex justify-between items-center py-3 border-b border-neutral-100 last:border-0">
      <span className="text-lg font-light text-neutral-900">{item.label}</span>
      <div className="text-right">
        <span className="text-lg font-light text-neutral-900">{item.value}</span>
        <span className="text-xs font-light text-neutral-500 ml-2">{item.meta}</span>
      </div>
    </div>
  ))}
</div>
```

#### ❌ Avoid These Chart Types:
- Pie charts (hard to read precisely)
- 3D anything (dated, distracting)
- Multiple bright colors
- Complex multi-axis charts
- Busy legends

### Data Presentation Rules
1. **Primary metric**: Largest, most prominent
2. **Supporting data**: Secondary hierarchy
3. **Context/meta**: Smallest, subtle
4. **Progress/status**: Use color strategically

---

## 🎭 Component Patterns

### Stat Card (Perfect Pattern)
```tsx
<button className="bg-white border border-neutral-200 p-8 hover:border-neutral-400 hover:shadow-md transition-all text-left w-full group">
  <div className="flex items-center justify-between mb-6">
    <Icon className="h-6 w-6 text-neutral-600 group-hover:text-nordic-blue-500 transition-colors" />
    <div className="flex items-center space-x-1 text-xs font-light text-sage-600">
      <ArrowUpRight className="h-4 w-4" />
      <span>12.5%</span>
    </div>
  </div>
  <p className="text-xs font-light text-neutral-500 mb-3 uppercase tracking-wider">
    Total Users
  </p>
  <p className="text-4xl font-extralight text-neutral-900">
    {value.toLocaleString()}
  </p>
</button>
```

### Content Section Pattern
```tsx
<div className="mb-16">
  <h2 className="text-3xl font-extralight text-neutral-900 mb-8">
    Section Title
  </h2>
  <div className="bg-white border border-neutral-200 p-8">
    {/* Content */}
  </div>
</div>
```

### Data Visualization Pattern
```tsx
<div className="bg-white border border-neutral-200 p-8">
  <div className="space-y-6 mb-8">
    {chartData.map((data, index) => (
      <div key={data.id} className="group">
        <div className="flex justify-between items-center mb-2">
          <p className="text-lg font-light text-neutral-900">{data.label}</p>
          <div className="text-right">
            <p className="text-lg font-light text-neutral-900">{data.value.toLocaleString()}</p>
            <p className="text-xs font-light text-neutral-500">{data.percentage}%</p>
          </div>
        </div>
        <div className="h-2 bg-neutral-100 overflow-hidden">
          <div
            className="h-full bg-nordic-blue-400 transition-all duration-1000 ease-out"
            style={{
              width: `${data.percentage}%`,
              transitionDelay: `${index * 200}ms`
            }}
          />
        </div>
      </div>
    ))}
  </div>

  {/* Summary Stats */}
  <div className="pt-8 border-t border-neutral-200">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {summaryStats.map((stat) => (
        <div key={stat.label}>
          <p className="text-2xl font-extralight text-neutral-900 mb-1">
            {stat.value.toLocaleString()}
          </p>
          <p className="text-xs font-light text-neutral-500 uppercase tracking-wider">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  </div>
</div>
```

---

## ✨ Animation & Interaction

### Timing Standards
```css
/* Micro-interactions */
--timing-instant: 100ms     /* Immediate feedback */
--timing-quick: 200ms       /* Hover states */
--timing-normal: 300ms      /* Standard transitions */
--timing-slow: 500ms        /* Loading, emphasis */
--timing-dramatic: 1000ms   /* Progress animations */

/* Easing */
--ease-standard: ease-out   /* Most interactions */
--ease-gentle: ease-in-out  /* Subtle movements */
--ease-bounce: ease-out     /* Never use actual bounce */
```

### Animation Principles
1. **Staggered sequences**: 200ms delays between elements
2. **Progressive disclosure**: Fade in with slight upward movement
3. **Loading states**: Gentle pulse, never aggressive spinning
4. **Hover feedback**: Subtle color and shadow changes
5. **Success states**: Brief, satisfying confirmation

### Interaction Patterns
```tsx
/* Standard Hover */
className="hover:border-neutral-400 hover:shadow-md transition-all duration-300"

/* Color Transition */
className="text-neutral-600 hover:text-nordic-blue-500 transition-colors duration-200"

/* Progress Animation */
style={{
  transition: 'width 1000ms ease-out',
  transitionDelay: `${index * 200}ms`
}}
```

---

## 🎯 Quality Checklist

### Before Implementing Any Component

#### Visual Design
- [ ] Uses only foundation colors + strategic life colors?
- [ ] Typography follows hierarchy exactly?
- [ ] Spacing consistent with scale?
- [ ] Borders and shadows subtle?
- [ ] Optically balanced (not just geometrically)?

#### Functionality
- [ ] Hover states defined?
- [ ] Loading states elegant?
- [ ] Error states supportive, not punitive?
- [ ] Responsive breakpoints considered?

#### Content
- [ ] Numbers formatted with toLocaleString()?
- [ ] Labels uppercase with tracking-wider?
- [ ] Information hierarchy clear?
- [ ] No unnecessary elements?

#### Performance
- [ ] Animations perform smoothly?
- [ ] Color contrast meets accessibility standards?
- [ ] Touch targets minimum 44px?
- [ ] Works without JavaScript for core content?

---

## 🚫 Anti-Patterns (Never Do This)

### Colors
- ❌ Multiple bright colors in one chart
- ❌ Red/green for anything other than positive/negative
- ❌ Color as the only way to convey information
- ❌ Background colors (except neutral-50/100)

### Typography
- ❌ More than 3 font weights on one page
- ❌ font-bold or font-semibold anywhere
- ❌ Mixed line heights without purpose
- ❌ All caps for more than labels

### Layout
- ❌ Inconsistent spacing (mixing p-4 and p-6)
- ❌ Elements closer than 0.75rem
- ❌ Sections without proper separation
- ❌ Cramped layouts

### Animations
- ❌ Bounce or elastic easing
- ❌ Animations longer than 1 second
- ❌ Movement without purpose
- ❌ Aggressive loading spinners

---

## 🏆 Examples of Excellence

### Perfect Data Visualization
```tsx
// Share Distribution - The Gold Standard
<div className="mb-16">
  <h2 className="text-3xl font-extralight text-neutral-900 mb-8">
    Share Distribution
  </h2>
  <div className="bg-white border border-neutral-200 p-8">
    <div className="space-y-6 mb-8">
      {chartData.map((shareholder, index) => {
        const widthPercentage = (shareholder.shares / maxShares) * 100;

        return (
          <div key={shareholder.id} className="group">
            <div className="flex justify-between items-center mb-2">
              <p className="text-lg font-light text-neutral-900">
                {shareholder.name.split(',')[0]}
              </p>
              <div className="text-right">
                <p className="text-lg font-light text-neutral-900">
                  {shareholder.shares.toLocaleString()}
                </p>
                <p className="text-xs font-light text-neutral-500">
                  {shareholder.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="h-2 bg-neutral-100 overflow-hidden">
              <div
                className="h-full bg-nordic-blue-400 transition-all duration-1000 ease-out"
                style={{
                  width: `${widthPercentage}%`,
                  transitionDelay: `${index * 200}ms`
                }}
              />
            </div>
          </div>
        );
      })}
    </div>

    <div className="pt-8 border-t border-neutral-200">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <p className="text-2xl font-extralight text-neutral-900 mb-1">
            {totalShares.toLocaleString()}
          </p>
          <p className="text-xs font-light text-neutral-500 uppercase tracking-wider">
            Total Shares
          </p>
        </div>
        <div>
          <p className="text-2xl font-extralight text-neutral-900 mb-1">
            {shareholderCount}
          </p>
          <p className="text-xs font-light text-neutral-500 uppercase tracking-wider">
            Shareholders
          </p>
        </div>
        <div>
          <p className="text-2xl font-extralight text-neutral-900 mb-1">
            {largestHolding.toLocaleString()}
          </p>
          <p className="text-xs font-light text-neutral-500 uppercase tracking-wider">
            Largest
          </p>
        </div>
        <div>
          <p className="text-2xl font-extralight text-neutral-900 mb-1">
            {averageHolding.toLocaleString()}
          </p>
          <p className="text-xs font-light text-neutral-500 uppercase tracking-wider">
            Average
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Perfect Interactive Element
```tsx
<div className="group cursor-pointer">
  <div className="bg-white border border-neutral-200 p-8 hover:border-nordic-blue-400 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center justify-between mb-6">
      <TrendingUp className="h-6 w-6 text-neutral-600 group-hover:text-nordic-blue-500 transition-colors" />
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="text-xs font-light text-sage-600 flex items-center space-x-1">
          <ArrowUpRight className="h-4 w-4" />
          <span>View Details</span>
        </div>
      </div>
    </div>
    <p className="text-xs font-light text-neutral-500 mb-3 uppercase tracking-wider">
      Growth Rate
    </p>
    <p className="text-4xl font-extralight text-neutral-900 group-hover:text-nordic-blue-600 transition-colors">
      +12.5%
    </p>
  </div>
</div>
```

---

## 🌟 Inspiration & References

### Visual References
- **Pelizzari.com**: Ultra-minimal elegance, dramatic typography
- **Anker Studio**: Clean grids, perfect spacing
- **Linear.app**: Sophisticated data presentation
- **Stripe Dashboard**: Professional financial interface
- **Figma**: Clean, purposeful interface design

### Color Inspiration
- **Nordic landscapes**: Deep blues, sage greens, warm stones
- **Scandinavian interiors**: Natural materials, subtle warmth
- **Modern financial tools**: Trust-building blues, success greens

### Typography Models
- **Kinfolk Magazine**: Ultra-light, generous spacing
- **Norm Architects**: Minimal, purposeful hierarchy
- **Apple Design**: Clear information architecture

---

## 📝 Implementation Notes

### Development Workflow
1. **Start with structure** (layout, spacing)
2. **Add typography** (hierarchy, readability)
3. **Apply foundation colors** (neutrals only)
4. **Test usability** (without color)
5. **Add strategic color** (life elements only)
6. **Polish animations** (subtle, purposeful)

### Testing Protocol
1. **Grayscale test**: Does it work without color?
2. **Squint test**: Is hierarchy clear?
3. **5-second test**: Can users find key information quickly?
4. **Color blind test**: Is information accessible?

### Maintenance
- Review color usage monthly (is it still strategic?)
- Test on different devices weekly
- Update examples when patterns evolve
- Document any exceptions with reasoning

---

> **Remember**: We're not just building software - we're crafting digital experiences that feel sophisticated, trustworthy, and effortlessly elegant. Every pixel should serve a purpose, and every color should earn its place.

**Last Updated**: 2025-09-14
**Version**: 1.0