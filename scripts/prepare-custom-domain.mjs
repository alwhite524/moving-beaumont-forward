// The custom domain is served by an existing account-owned Worker, separately
// from the Sites URL. Publish the same validated build to both destinations.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const build = path.join(root, 'dist/server');
const config = JSON.parse(fs.readFileSync(path.join(build, 'wrangler.json'), 'utf8'));
config.name = 'moving-beaumont-forward';
config.account_id = '2e9aae1d93537787795a80429a6edb4c';
config.main = path.join(build, 'index.js');
config.base_dir = build;
config.find_additional_modules = true;
config.assets = { directory: path.join(root, 'dist/client'), binding: 'ASSETS' };
config.images = { binding: 'IMAGES' };
config.workers_dev = false;
config.preview_urls = false;
config.routes = [{ pattern: 'movingbeaumontforward.com', custom_domain: true }];
config.observability = { enabled: false };
fs.mkdirSync(path.join(root, '.wrangler'), { recursive: true });
fs.writeFileSync(path.join(root, '.wrangler/mbf-domain.json'), JSON.stringify(config, null, 2));
console.log('Prepared existing MBF custom-domain Worker configuration from the validated build.');
