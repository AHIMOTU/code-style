const fs = require('fs')
const path = require('path')
const { prompt } = require('enquirer')
const semver = require('semver')
const minimist = require('minimist')
const chalk = require('chalk')
const execa = require('execa')

const args = minimist(process.argv.slice(2))
const currentVersion = require('../package.json').version
const preId =
  args.preid ||
  (semver.prerelease(currentVersion) && semver.prerelease(currentVersion)[0])
const versionIncrements = [
  'patch',
  'minor',
  'major',
  ...(preId ? ['prepatch', 'preminor', 'premajor', 'prerelease'] : [])
]
const inc = (i) => semver.inc(currentVersion, i, preId)
const step = (msg) => console.log(chalk.cyan(msg))
const run = (bin, args, opts = {}) =>
  execa(bin, args, { stdio: 'inherit', ...opts })

async function main() {
  const { release } = await prompt({
    type: 'select',
    name: 'release',
    message: 'Select release type',
    choices: versionIncrements.map((i) => `${i} (${inc(i)})`)
  })
  const targetVersion = release.match(/\((.*)\)/)[1]

  const { yes } = await prompt({
    type: 'confirm',
    name: 'yes',
    message: `Releasing v${targetVersion}. Confirm?`
  })
  if (!yes) return

  step('\nUpdating package version...')
  updatePackage(path.resolve(__dirname, '../package.json'), targetVersion)

  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
  if (stdout) {}

  step('\nPublishing package...')

  step('\nPushing to Github...')
}

function updatePackage(pkgPath, version) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  pkg.version = version
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

main().catch((error) => {
  console.error(error)
})
