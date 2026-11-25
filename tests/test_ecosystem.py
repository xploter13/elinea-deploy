"""Cross-repository contracts; run in a checkout containing the sibling repositories."""
import json
import os
from pathlib import Path
import subprocess
import unittest


WORKSPACE = Path(os.environ.get('ELINEA_WORKSPACE', Path(__file__).resolve().parents[2]))
DEPLOY = Path(__file__).resolve().parents[1]
RENAMES = {
    'elinea-api': 'elinea-ecommerce-api',
    'elinea-admin': 'elinea-ecommerce-admin',
    'elinea-storefront': 'elinea-ecommerce-storefront',
}


class EcosystemContracts(unittest.TestCase):
    def test_workspace_is_not_a_package_monorepo(self):
        self.assertFalse((WORKSPACE / 'package.json').exists())
        self.assertFalse((WORKSPACE / 'pnpm-workspace.yaml').exists())

    def test_reorganized_repositories_retain_original_history(self):
        baseline = json.loads((DEPLOY / 'docs/ecosystem/baseline/repositories.json').read_text())
        for record in baseline:
            repository = WORKSPACE / RENAMES.get(record['repository'], record['repository'])
            if not repository.exists():
                self.skipTest('Full sibling workspace is required')
            with self.subTest(repository=repository.name):
                self.assertTrue((repository / '.git').exists())
                subprocess.run(['git', '-C', str(repository), 'cat-file', '-e', record['head'] + '^{commit}'], check=True, capture_output=True)

    def test_local_package_dependencies_resolve_to_the_declared_package(self):
        checked = 0
        for repository in WORKSPACE.glob('elinea-*'):
            manifest = repository / 'package.json'
            if not manifest.exists():
                continue
            package = json.loads(manifest.read_text())
            for group in ['dependencies', 'devDependencies', 'peerDependencies']:
                for name, version in package.get(group, {}).items():
                    if not version.startswith('file:'):
                        continue
                    target = repository / version.removeprefix('file:') / 'package.json'
                    with self.subTest(consumer=repository.name, dependency=name):
                        self.assertTrue(target.exists(), str(target))
                        self.assertEqual(json.loads(target.read_text())['name'], name)
                    checked += 1
        self.assertGreater(checked, 0)

    def test_npm_lock_root_identity_matches_application_manifest(self):
        for repository in WORKSPACE.glob('elinea-*'):
            lock_path = repository / 'package-lock.json'
            manifest_path = repository / 'package.json'
            if not lock_path.exists() or not manifest_path.exists():
                continue
            package = json.loads(manifest_path.read_text())
            lock = json.loads(lock_path.read_text())
            with self.subTest(repository=repository.name):
                self.assertEqual(lock['name'], package['name'])
                self.assertEqual(lock['packages']['']['name'], package['name'])

    def test_checkout_paths_and_legal_contract_fixture_exist(self):
        workflow = (DEPLOY / '.github/workflows/publish-images.yml').read_text()
        for repository in ['elinea-ecommerce-api', 'elinea-ecommerce-storefront', 'elinea-sdk', 'elinea-ui']:
            self.assertIn('path: workspace/' + repository, workflow)
            self.assertTrue((WORKSPACE / repository / '.git').exists())
        self.assertTrue((WORKSPACE / 'elinea-ecommerce-api/resources/legal/terms-1.1.md').exists())

    def test_release_checkouts_use_the_selected_environment_branch(self):
        workflow = (DEPLOY / '.github/workflows/publish-images.yml').read_text()
        checkouts = workflow.split('uses: actions/checkout@v4')[1:]
        self.assertEqual(len(checkouts), 8)
        for checkout in checkouts:
            self.assertIn("ref: ${{ inputs.environment == 'production' && 'master' || 'develop' }}", checkout.split('      - name:')[0])
        for environment, branch in [('production', 'master'), ('homologation', 'develop')]:
            result = subprocess.run(['bash', str(DEPLOY / 'scripts/deploy.sh'), '--' + environment, '--dry-run'], check=True, capture_output=True, text=True)
            self.assertIn('Branch: ' + branch, result.stdout)

    def test_existing_image_names_remain_compatible_with_compose(self):
        workflow = (DEPLOY / '.github/workflows/publish-images.yml').read_text()
        compose = (DEPLOY / 'compose.yml').read_text()
        for name in ['elinea-api', 'elinea-api-web', 'elinea-storefront']:
            self.assertIn('/' + name + ':', workflow)
            self.assertIn('/' + name + ':', compose)

    def test_deploy_scripts_are_valid_linux_shell(self):
        for path in (DEPLOY / 'scripts').glob('*.sh'):
            with self.subTest(script=path.name):
                self.assertNotIn(b'\r\n', path.read_bytes())
                subprocess.run(['bash', '-n', str(path)], check=True, capture_output=True)


if __name__ == '__main__':
    unittest.main()
