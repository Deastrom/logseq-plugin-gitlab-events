import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'

export const settings: SettingSchemaDesc[] = [
    {
        key: "host",
        title: "Gitlab Instance",
        description: "Gitlab Instance Host URL",
        type: "string",
        default: "https://gitlab.com",
    },
    {
        key: "token",
        title: "Personal Token",
        description: "Personal Token. Required (one of the three tokens are required)",
        type: "string",
        default: null,
    },
]