import "@logseq/libs";
import { Gitlab } from "@gitbeaker/rest";
import { settings } from './settings';
import { ExpandedUserSchema } from "@gitbeaker/rest";

function main() {
  logseq.UI.showMsg(`Hello from Ben`)

  logseq.useSettingsSchema(settings);

  logseq.Editor.registerSlashCommand('Update Gitlab Entry', (_) => { return updateGitlabEntry();})
}

async function updateGitlabEntry() {
  try {
    const glApi = new Gitlab({
      host: logseq.settings?.host,
      token: logseq.settings?.token,
    });
    const currentGlUser:ExpandedUserSchema = await glApi.Users.showCurrentUser()
    console.log(currentGlUser)
    const currentBlock = await logseq.Editor.getCurrentBlock();

    const value = currentBlock?.content;
    const uuid = currentBlock?.uuid;
    const currentPage = await logseq.Editor.getCurrentPage();

    console.log(currentPage?.journalDay)
    const followedUsers = await glApi.Users.allFollowing(currentGlUser.id)
    console.log(followedUsers)
    const firstFollowedUsersEvents = await glApi.Events.all({
      userId: followedUsers[5].id,
      before: "2023-06-07",
      after: "2023-06-05",
    })
    console.log(firstFollowedUsersEvents)
  }
  catch (e) {
    if (e instanceof Error) {
      console.error('logseq-plugin-gitlab-events', e.message)
    }
  }
}


logseq.ready(main).catch(console.error);
