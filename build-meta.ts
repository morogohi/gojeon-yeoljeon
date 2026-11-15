import type { Plugin } from 'vite';

/** 빌드한 커밋을 HTML 에 남긴다. 배포 후 공개 사이트가 그 커밋인지 확인하는 데 쓴다. */
export function buildMeta(): Plugin {
  const sha = process.env.BUILD_SHA || process.env.GITHUB_SHA || 'dev';
  return {
    name: 'gojeon-build-meta',
    transformIndexHtml(html) {
      return html.replace('</head>', `  <meta name="build-sha" content="${sha.replace(/[^0-9a-zA-Z._-]/g, '')}" />\n</head>`);
    },
  };
}
