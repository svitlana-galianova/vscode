/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as nls from 'vs/nls';
import 'vs/css!./media/update.contribution';
import product from 'vs/platform/node/product';
import { Registry } from 'vs/platform/registry/common/platform';
import { IWorkbenchContributionsRegistry, Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { ReleaseNotesEditor } from 'vs/workbench/parts/update/electron-browser/releaseNotesEditor';
import { ReleaseNotesInput } from 'vs/workbench/parts/update/electron-browser/releaseNotesInput';
import { IGlobalActivityRegistry, GlobalActivityExtensions } from 'vs/workbench/common/activity';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { IWorkbenchActionRegistry, Extensions as ActionExtensions } from 'vs/workbench/common/actions';
import { SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { IConfigurationRegistry, Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import { ShowCurrentReleaseNotesAction, ProductContribution, UpdateContribution, Win3264BitContribution } from './update';
import { EditorDescriptor, IEditorRegistry, Extensions as EditorExtensions } from 'vs/workbench/browser/editor';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';

Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench)
	.registerWorkbenchContribution(ProductContribution, LifecyclePhase.Running);

if (process.platform === 'win32' && process.arch === 'ia32') {
	Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench)
		.registerWorkbenchContribution(Win3264BitContribution, LifecyclePhase.Running);
}

Registry.as<IGlobalActivityRegistry>(GlobalActivityExtensions)
	.registerActivity(UpdateContribution);

// Editor
const editorDescriptor = new EditorDescriptor(
	ReleaseNotesEditor,
	ReleaseNotesEditor.ID,
	nls.localize('release notes', "Release notes")
);

Registry.as<IEditorRegistry>(EditorExtensions.Editors)
	.registerEditor(editorDescriptor, [new SyncDescriptor(ReleaseNotesInput)]);

Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(new SyncActionDescriptor(ShowCurrentReleaseNotesAction, ShowCurrentReleaseNotesAction.ID, ShowCurrentReleaseNotesAction.LABEL), 'Show Release Notes');

// Configuration: Update
const configurationRegistry = <IConfigurationRegistry>Registry.as(ConfigurationExtensions.Configuration);
configurationRegistry.registerConfiguration({
	'id': 'update',
	'order': 15,
	'title': nls.localize('updateConfigurationTitle', "Update"),
	'type': 'object',
	'properties': {
		'update.channel': {
			'type': 'string',
			'enum': ['none', 'default'],
			'default': 'default',
			'description': nls.localize('updateChannel', "Configure whether you receive automatic updates from an update channel. Requires a restart after change.")
		},
		'update.enableWindowsBackgroundUpdates': {
			'type': 'boolean',
			'default': product.quality === 'insider',
			'description': nls.localize('enableWindowsBackgroundUpdates', "Enables Windows background updates.")
		}
	}
});
