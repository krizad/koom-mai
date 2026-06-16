import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  const isGithubActions = process.env.GITHUB_ACTIONS === "true";
  const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
  const repositoryOwner = process.env.GITHUB_REPOSITORY_OWNER ?? "";
  const isUserOrOrgPagesRepo = repositoryName !== "" && repositoryOwner !== "" && repositoryName.toLowerCase() === `${repositoryOwner.toLowerCase()}.github.io`;
  const basePath = isGithubActions && repositoryName && !isUserOrOrgPagesRepo ? `/${repositoryName}` : "";

  return {
    name: 'Koom Mai',
    short_name: 'Koom Mai',
    description: 'Koom Mai Application',
    start_url: `${basePath}/`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: `${basePath}/logo.png`,
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
