 const fs = require("fs");
 const path = require("path");

module.exports = (RED) => {
    // console.log(RED.settings.flowforge)
    // Need to gate loading this (and the html) on a settings.js flag
    if (RED.settings.flowforge?.subflowExport?.enabled) {
    RED.plugins.registerPlugin('flowfuse-nr-subflow-export', {
        type: 'subflow',
        name: 'Node-RED SubFlow Export Plugin',
        icon: 'font-awesome/fa-magic',
        onadd: function () {
            RED.httpAdmin.post('/ff/package-subflow', async function (req, res) {
                console.log(`${RED.settings.flowforge.forgeURL}/api/v1/teams/${RED.settings.flowforge.teamID}/npm/subflow`)
                try {
                    const response = await fetch(`${RED.settings.flowforge.forgeURL}/api/v1/teams/${RED.settings.flowforge.teamID}/npm/subflow`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            package: req.body.package,
                            subflow: req.body.def
                        }),
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${RED.settings.httpStorage.token}`
                        }
                    })
                    if (response.status === 200 || response.status === 204) {
                        res.status(200).send()
                        return
                    } else if (response.status === 409) {
                        res.status(409).send()
                        return
                    } else if (response.status === 403) {
                        res.status(403).send()
                    }
                    console.log('other status',response.status)
                } catch (err) {
                    console.log(err)
                }
                res.status(500).send()
            })
            RED.comms.publish('ff-subflow-plugin/init', {teamId: RED.settings.flowforge.teamID}, true /* retain */)
        }
    })
    RED.log.info('FlowFuse SubFlow Plugin loaded')
    } else {
       RED.log.info('FlowFuse SubFlow Plugin not loaded')
    }
}