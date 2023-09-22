import "@logseq/libs";
import moment from "moment";
import { Gitlab } from "@gitbeaker/rest";
import { settings } from './settings';
import { ExpandedUserSchema } from "@gitbeaker/rest";

function main() {
  logseq.useSettingsSchema(settings);
  logseq.Editor.registerSlashCommand(
    'Update Gitlab Entry', 
    async () => { await updateGitlabEntry(); }
  )
  console.log("logseq-plugin-gitlab-events loaded")
}

async function updateGitlabEntry() {
  try {
    const blockValues = new Array<string>();
    const glApi = new Gitlab({
      host: logseq.settings?.host,
      token: logseq.settings?.token,
    });
    const currentGlUser:ExpandedUserSchema = await glApi.Users.showCurrentUser()
    const currentBlock = await logseq.Editor.getCurrentBlock();
    if (currentBlock) {
      const currentPage = await logseq.Editor.getPage(currentBlock.page.id);
      if (currentPage) {
        if (currentPage.journalDay !== undefined){
          logseq.Editor.updateBlock(currentBlock.uuid, "Appending Gitlab Followed User Events...")
          const beforeDate = moment(`${currentPage.journalDay}`, "YYYYMMDD").add(1, 'days')
          const afterDate = moment(`${currentPage.journalDay}`, "YYYYMMDD").subtract(1, 'days')
          const followedUsers = await glApi.Users.allFollowing(currentGlUser.id)
          followedUsers.push(currentGlUser)
          for (const user of followedUsers) {
            const events = await glApi.Events.all({
              userId: user.id,
              before: beforeDate.format("YYYY-MM-DD"),
              after: afterDate.format("YYYY-MM-DD"),
            })
            for (const event of events) {
              const project = await glApi.Projects.show(event.project_id)
              let value = ''
              if (event.target_type) {
                value = `[[${event.author.name}]] participated in [[${project.path_with_namespace}]]`
              } else if (event.push_data) {
                value = `[[${event.author.name}]] contributed to [[${project.path_with_namespace}]]`
              }
              if (value != '' && !blockValues.includes(value)){
                blockValues.push(value)
              }
            }
          }
          for await (const value of blockValues){
            logseq.Editor.insertBlock(
              currentBlock.uuid,
              value,
            )
          }
          logseq.Editor.updateBlock(currentBlock.uuid, "Gitlab Followed User Events")
        }
      }
      else {
        logseq.Editor.updateBlock(currentBlock.uuid, "Update Gitlab Entry can only be called from a Journal Page")
      }
    }
  }
  catch (e) {
    if (e instanceof Error) {
      console.error('logseq-plugin-gitlab-events', e.message)
    }
  }
}

logseq.ready(main).catch(console.error);
