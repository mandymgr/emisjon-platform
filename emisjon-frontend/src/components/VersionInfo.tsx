import packageJson from '../../package.json';

export default function VersionInfo() {
  const isDev = import.meta.env.DEV;
  const gitHash = import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || '';

  return (
    <div className="mt-3 text-xs text-muted-foreground opacity-50 hover:opacity-100 transition-opacity">
      <div className="bg-sidebar-accent/30 backdrop-blur-sm rounded-md px-3 py-1.5 space-y-0.5 border border-sidebar-border/50">
        <div className="font-medium">v{packageJson.version}</div>
        {gitHash && <div className="text-muted-foreground/70">#{gitHash}</div>}
        {isDev && <div className="text-yellow-500 font-medium">DEV MODE</div>}
      </div>
    </div>
  );
}