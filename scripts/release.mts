import { writeFile, stat } from 'fs/promises';
import { execSync } from 'child_process';
import dedent from 'dedent';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (input) => {
            resolve(input.trim());
        });
    });
}

let exists, tag;
const body = ".github/workflows/release-body.md"

async function checkOrCreateFile(filename: string): Promise<void> {
    try {
        try {
            await stat(filename);
        } catch {
            console.log(`Creating ${filename} because it doesn't exist. avoid to delete it.`);
            await writeFile(filename, '');
        }
    } catch (error) {
        console.error('Error checking or creating file:', error.message);
    }
}

async function createReleaseNotesFile(tagMessage: string) {
    try {
        await writeFile(body, tagMessage);
        console.log(`Release notes for tag ${tag} have been written to release-body.md`);
    } catch (error) {
        console.error('Error writing release notes:', error.message);
    }
}

async function createTag() {
    const currentVersion = process.env.npm_package_version;
    tag = `${currentVersion}`;

    // Check or create body.md before asking for the commit message
    await checkOrCreateFile(body);
    exists = execSync(`git tag -l ${tag}`).toString().includes(tag);
    if (exists) {
        rl.question(`Tag ${tag} already exists.If you continue, it will be replaced. Do you want to continue? (Yes/No): `, async (answer) => {
            if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
                process.exit();
            } else {
                execSync(`git tag -d ${tag}`);
                execSync(`git push origin :refs/tags/${tag}`); // Push the delete to remote repository
                console.log(`Deleted existing tag ${tag} locally and remotely.`);
                doCommit(currentVersion)
            }
        });
    } else {
        doCommit(currentVersion)
    }
}

createTag();

async function doCommit(currentVersion: string|undefined) {
    rl.question(`Enter the commit message for version ${currentVersion}: `, async (message) => {
        doNextSteps(message);
        rl.close();
    });
}

async function doNextSteps(message: unknown) {
    let tagMessage = `${message}`;
    const messages = tagMessage.split('\\n');
    const toShow = tagMessage.replace(/\\n/g, '\n');
    await createReleaseNotesFile(toShow);
    tagMessage = messages.map(message => `-m "${message}"`).join(' ');
    execSync(`git add ${body}`);
    execSync('git commit -m "update tag description"');
    execSync('git push');
    execSync(`git tag -a ${tag} ${tagMessage}`);
    execSync(`git push origin ${tag}`);
    console.log(`Release ${tag} pushed to repo.`);
    console.log(dedent`
            with message: 
            ${toShow}
            `);
}
