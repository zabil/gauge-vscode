import * as path from 'path';
import { QuickPickItem } from 'vscode';

const COPY_TO_CLIPBOARD = 'Copy To Clipboard';
export class FileListItem implements QuickPickItem {
    label: string;
    description: string;
    value: string;

    constructor(l: string, d: string, v: string) {
        this.label = l;
        this.description = d;
        this.value = v;
    }

    isCopyToClipBoard() {
        return this.value === COPY_TO_CLIPBOARD;
    }
}
