# webflow + ts 

- use pkg.json > "peerDependecies" block to auto-exclude from rollup build? (because we want frontend to use pkg map to resolve efficient pkg loading)

- still need to manually add this importmap for now:
```
<script type="importmap">
  {
    "imports": {
      "dat.gui": "https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/+esm",
      "three": "https://cdn.jsdelivr.net/npm/three@0.169.0/+esm"
    }
  }
</script>
```