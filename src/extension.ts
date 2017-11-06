'use strict';

import * as path from 'path';

import { workspace, Disposable, ExtensionContext, Uri } from 'vscode';
import { LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, TransportKind, Location as LSLocation, Position as LSPosition } from 'vscode-languageclient';
import vscode = require('vscode');
import fs = require('fs');
import cp = require('child_process');
import opn = require('opn')
import { execute } from "./execution/gaugeExecution"

export function activate(context: ExtensionContext) {
	if (fs.readdirSync(vscode.workspace.rootPath).includes("manifest.json")) {
        if (cp.spawnSync('gauge', []).error) {
            vscode.window.showWarningMessage("Cannot find 'gauge' executable in PATH.", 'Install').then(selected => {
                if (selected === 'Install') {
                    opn('https://getgauge.io/get-started.html');
                }
            });
            return
        }
		let languageClient = new LanguageClient(
			'Gauge Language Server',
			{
				command: 'gauge',
				args: ["daemon", "--lsp", "--dir=" + vscode.workspace.rootPath],
			},
			{
				documentSelector: ['markdown'],
			}
		);
        let disposable = languageClient.start();
        context.subscriptions.push(vscode.commands.registerCommand('gauge.execute', (args) => { execute(args, false) }));
        context.subscriptions.push(vscode.commands.registerCommand('gauge.execute.inParallel', (args) => { execute(args, true) }));
        context.subscriptions.push(vscode.commands.registerCommand('gauge.execute.failed', () => { execute(null, { rerunFailed: true }) }));
        context.subscriptions.push(vscode.commands.registerCommand('gauge.showReferences', (uri: string, position: LSPosition, locations: LSLocation[]) => {
            if (locations && locations.length > 0) {
                vscode.commands.executeCommand('editor.action.showReferences', Uri.parse(uri), languageClient.protocol2CodeConverter.asPosition(position),
                    locations.map(languageClient.protocol2CodeConverter.asLocation))
            }
        }));
        context.subscriptions.push(disposable);

        return {
			extendMarkdownIt(md) {
				md.options.html = false;
				return md;
			}
		}
	}
}
