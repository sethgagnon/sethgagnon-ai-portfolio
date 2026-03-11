

# Add Profile Photo to Hero Section

## Change
**`src/components/HeroSection.tsx`** - Add a circular avatar image between the status badge and the name heading, using the Avatar component.

- Place an `<Avatar>` (roughly 128x128px) with `<AvatarImage>` pointing to a photo file, and an `<AvatarFallback>` of "SG"
- Position it with a small bottom margin before the `<h1>`
- Photo file: You'll need to upload a headshot. I'll reference it as `/seth-gagnon.jpg` in the public folder - you can upload/replace the image after.

## Layout
```text
[ Status badge ]
[ Avatar photo ]    <-- new
[ Seth Gagnon  ]
[ Subtitle     ]
```

