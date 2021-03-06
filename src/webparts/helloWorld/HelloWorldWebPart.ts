import {
  BaseClientSideWebPart,
  IPropertyPaneSettings,
  IWebPartContext,
  PropertyPaneTextField,
  PropertyPaneCheckbox,
  PropertyPaneDropdown,
  PropertyPaneToggle
} from '@microsoft/sp-client-preview';

import styles from './HelloWorld.module.scss';
import * as strings from 'mystrings';
import { IHelloWorldWebPartProps } from './IHelloWorldWebPartProps';
import MockHttpClient from './MockHttpClient';
import { EnvironmentType } from '@microsoft/sp-client-base';
export interface ISPLists {
  value: ISPList[];
}

export interface ISPList {
  Title: string;
  Id: string;
}

export default class HelloWorldWebPart extends BaseClientSideWebPart<IHelloWorldWebPartProps> {

  public constructor(context: IWebPartContext) {
    super(context);
  }

  public render(): void {
this.domElement.innerHTML = `
<div class="${styles.helloWorld}">
  <div class="${styles.container}">
    <div class="ms-Grid-row ms-bgColor-themeDark ms-fontColor-white ${styles.row}">
      <div class="ms-Grid-col ms-u-lg10 ms-u-xl8 ms-u-xlPush2 ms-u-lgPush1">
        <span class="ms-font-xl ms-fontColor-white">Welcome to SharePoint!</span>
        <p class="ms-font-l ms-fontColor-white">Customize SharePoint experiences using Web Parts.</p>
        <p class="ms-font-l ms-fontColor-white">${this.properties.description}</p>
        <p class="ms-font-l ms-fontColor-white">${this.properties.test2}</p>
        <p class='ms-font-l ms-fontColor-white'>Loading from ${this.context.pageContext.web.title}</p>
        <a href="https://github.com/SharePoint/sp-dev-docs/wiki" class="ms-Button ${styles.button}">
          <span class="ms-Button-label">Learn more</span>
        </a>
      </div>
    </div>
    <div id="spListContainer" />
  </div>
</div>`;

this._renderListAsync();
  }
  private _getMockListData(): Promise<ISPLists> {
    return MockHttpClient.get(this.context.pageContext.web.absoluteUrl).then(() => {
        const listData: ISPLists = {
            value:
            [
                { Title: 'Mock List One', Id: '1' },
                { Title: 'Mock List Two', Id: '2' },
                { Title: 'Mock List Three', Id: '3' }
            ]
            };

        return listData;
    }) as Promise<ISPLists>;
  }
  private _getListData(): Promise<ISPLists> {
  return this.context.httpClient.get(this.context.pageContext.web.absoluteUrl + `/_api/web/lists?$filter=Hidden eq false`)
    .then((response: Response) => {
    return response.json();
    });
  }
  private _renderListAsync(): void {
  // Local environment
  if (this.context.environment.type === EnvironmentType.Local) {
    this._getMockListData().then((response) => {
      this._renderList(response.value);
    }); }
    else {
    this._getListData()
      .then((response) => {
        this._renderList(response.value);
      });
    }
  }
  private _renderList(items: ISPList[]): void {
  let html: string = '';
  items.forEach((item: ISPList) => {
    html += `
    <ul class="${styles.list}">
        <li class="${styles.listItem}">
            <span class="ms-font-l">${item.Title}</span>
        </li>
    </ul>`;
  });

  const listContainer: Element = this.domElement.querySelector('#spListContainer');
  listContainer.innerHTML = html;
  }
  protected get propertyPaneSettings(): IPropertyPaneSettings {
  return {
    pages: [
      {
        header: {
          description: strings.PropertyPaneDescription
        },
        groups: [
          {
            groupName: strings.BasicGroupName,
            groupFields: [
            PropertyPaneTextField('description', {
              label: 'Description'
            }),
            PropertyPaneTextField('test', {
              label: 'Multi-line Text Field',
              multiline: true
            }),
            PropertyPaneCheckbox('test1', {
              text: 'Checkbox'
            }),
            PropertyPaneDropdown('test2', {
              label: 'Dropdown',
              options: [
                { key: '1', text: 'One' },
                { key: '2', text: 'Two' },
                { key: '3', text: 'Three' },
                { key: '4', text: 'Four' }
              ]}),
            PropertyPaneToggle('test3', {
              label: 'Toggle',
              onText: 'On',
              offText: 'Off'
            })
          ]
          }
        ]
      }
    ]
  };
}
}
