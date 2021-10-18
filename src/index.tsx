import * as React from "react";
import * as ReactDOM from 'react-dom';

import {
  initLrs,
  saveAttachments,
  retrieveActivityState,
  saveActivityState
} from "@openlearning/xapi";

import { App, AppState } from './App';


const lrsConfig = initLrs();

const asciiToB64Url = (ascii: string) => {
  return encodeURIComponent(window.btoa(ascii));
};

const b64UrlToAscii = (b64: string) => {
  return window.atob(decodeURIComponent(b64));
};


const shareAccessUrl = new URL(document.location.href);

const urlSearchParams = new URLSearchParams(window.location.search);
const shareDataB64 = urlSearchParams.get("share");
const appState = shareDataB64 ? JSON.parse(b64UrlToAscii(shareDataB64)) : undefined;

const onSave = (savedState: AppState) => {
  if (!lrsConfig) {
    console.log("Unable to save: no LRS.", savedState);
    return Promise.resolve();
  }

  return saveActivityState(lrsConfig, "appState", {
    appState: savedState as any,
  }).then(() => {});
};


const onPublish = (publishState: AppState) => {
  const serializedState = JSON.stringify(publishState);
  shareAccessUrl.search = `?share=${asciiToB64Url(
    serializedState
  )}`;

  if (!lrsConfig) {
    console.log(shareAccessUrl.toString());
    return;
  }

  return saveAttachments(lrsConfig, [
    {
      contentType: "text/html",
      fileUrl: shareAccessUrl.toString(),
      description: "Turing Machine Program",
      display: "Turing Machine Program",
    },
  ]).then(() => {});
};

const render = (stateToRender: AppState, readOnly: boolean) => {
  ReactDOM.render(<App initialAppState={stateToRender} onSave={onSave} onPublish={onPublish} readOnly={readOnly} />, document.getElementById('root'));
}

if (appState) {
  render(appState, !lrsConfig);
} else if (lrsConfig) {
  retrieveActivityState(lrsConfig, "appState", null).then((state) => {
    const stateObject: any = state;
    const appState: AppState = stateObject?.appState || undefined;

    render(appState, false);
  });
} else {
  render(undefined, false);
}
