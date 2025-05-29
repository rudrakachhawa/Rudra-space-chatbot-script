/* eslint-disable */
class EmbedRag {
    constructor(options = {}) {
        this.props = {};
        this.parentContainer = null;
        this.state = {
            tempDataToSend: {},
        }
        this.loginUrl = 'https://db.gtwy.ai/user/embed/login';
        this.urlToRag = 'http://localhost:3001/rag';
        this.scriptId = 'rag-main-script';
        this.embedToken = '';
        this.configuration = {};
        this.iframe = null;

        this.initialize();
    }

    extractScriptProps() {
        const ragScript = document.getElementById('rag-main-script');
        if (!ragScript) {
            console.log('Script tag not found');
            return {};
        }

        const attributes = ['parentId', 'embedToken', 'chunkingType', 'hideConfig', 'listPage'];
        if (!ragScript.hasAttribute('embedToken')) {
            console.error('Embed token is required');
            return {};
        }

        return attributes.reduce((props, attr) => {
            if (ragScript.hasAttribute(attr)) {
                let value = ragScript.getAttribute(attr);
                props[attr] = value;
                this.props[attr] = value;
                this.state.tempDataToSend = { ...this.state.tempDataToSend, [attr]: value }
            }
            return props;
        }, {});
    }

    initialize() {
        const script = document.getElementById(this.scriptId);
        if (!script) {
            console.error(`Script tag with id '${this.scriptId}' not found`);
            return;
        }
        this.extractScriptProps();
        this.createIframe();
        this.authenticateAndLoad();

        window.openRag = this.openIframe.bind(this);
        window.closeRag = this.closeIframe.bind(this);
        window.Rag = {
            open: this.openIframe.bind(this),
            close: this.closeIframe.bind(this),
        }

        window.addEventListener('message', (event) => {
            if (event.data.type === 'closeRag') {
                this.closeIframe();
            }
        });
    }

    changeContainer(parentId, parentContainer = this.parentContainer) {
        const container = parentId && document.getElementById(parentId);
        if (container) {
            container.style.position = 'relative';
            parentContainer.style.position = 'absolute';
            container.appendChild(parentContainer);
        } else {
            document.body.appendChild(parentContainer);
        }
    }

    createIframe() {
        this.parentContainer = document.createElement('div');
        this.parentContainer.id = 'iframe-parent-container';
        this.parentContainer.style.height = '100%';
        this.parentContainer.style.width = '100%';
        this.iframe = document.createElement('iframe');
        // this.iframe.style.display = 'none';
        this.iframe.style.width = '100%';
        this.iframe.style.height = '100%';
        this.iframe.style.border = 'none';
        this.iframe.style.zIndex = '999999';
        this.iframe.sandbox = 'allow-same-origin allow-scripts allow-popups allow-forms';
        this.iframe.allow = 'cross-origin-isolated';

        this.parentContainer.appendChild(this.iframe);

        const parentId = this.state.tempDataToSend?.parentId || this.props?.parentId;
        this.changeContainer(parentId);
    }

    authenticateAndLoad() {
        if (!this.props?.embedToken) return;

        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.props.embedToken,
            },
        };

        this.configuration = {
            chunkingType: this.props.chunkingType || null,
            hideConfig: this.props.hideConfig || null,
            listPage: this.props.listPage || null,
        };

        fetch(this.loginUrl, requestOptions)
            .then(async (response) => {
                const result = await response.json();
                const dataToPass = {
                    ...result?.data,
                    configuration: this.configuration,
                };

                const encodedData = encodeURIComponent(JSON.stringify(dataToPass));
                const finalUrl = `${this.urlToRag}?ragDetails=${encodedData}`;
                this.iframe.src = finalUrl;

                return result;
            })
            .catch((error) => {
                console.error('Fetch error:', error);
            });
    }

    openIframe() {
        if (this.iframe) {
            // this.iframe.style.display = 'block';
        }
    }

    closeIframe() {
        if (this.iframe) {
            // this.iframe.style.display = 'none';
        }
    }
}

// Auto-initialize when script loads
new EmbedRag();