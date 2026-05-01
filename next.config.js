/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const repositoryOwner = process.env.GITHUB_REPOSITORY_OWNER ?? "";
const isUserOrOrgPagesRepo = repositoryName !== "" && repositoryOwner !== "" && repositoryName.toLowerCase() === `${repositoryOwner.toLowerCase()}.github.io`;
const basePath = isGithubActions && repositoryName && !isUserOrOrgPagesRepo ? `/${repositoryName}` : "";

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
