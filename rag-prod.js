/* eslint-disable */
class EmbedRag {
    constructor(options = {}) {
        this.props = {};
        this.parentContainer = null;
        this.modalContainer = null;
        this.state = {
            tempDataToSend: {},
        }
        this.loginUrl = 'https://db.gtwy.ai/user/embed/login';
        this.urlToRag = 'http://localhost:3001/rag';
        this.scriptId = 'rag-main-script';
        this.embedToken = '';
        this.configuration = {};
        this.iframe = null;
        this.modalIframe = null;

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
        window.closeRag = () => { this.closeIframe(), this.closeModal() };
        window.Rag = {
            open: this.openIframe.bind(this),
            close: () => { this.closeIframe(), this.closeModal() },
            openModal: this.openModal.bind(this),
            closeModal: this.closeModal.bind(this),
        }

        window.addEventListener('message', (event) => {
            if (event.data.type === 'closeRag') {
                this.closeIframe(); this.closeModal();
            } else if (event.data.type === 'openModal') {
                this.openModal(event.data.data);
            } else if (event.data.type === 'closeModal') {
                this.closeModal();
            }
            else if (event.data.type === 'fetch') {
                console.log(event.data.data, 23423)
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

    createModalContainer() {
        if (this.modalContainer) return;

        this.modalContainer = document.createElement('div');
        this.modalContainer.id = 'rag-modal-container';
        this.modalContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 50vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999999;
            display: none;
            backdrop-filter: blur(4px);
        `;

        this.modalIframe = document.createElement('iframe');
        this.modalIframe.style.cssText = `
            width: 100vw;
            height: 100vh;
            border: none;
        `;
        this.modalIframe.sandbox = 'allow-same-origin allow-scripts allow-popups allow-forms';
        this.modalIframe.allow = 'cross-origin-isolated';

        this.modalContainer.appendChild(this.modalIframe);
        document.body.appendChild(this.modalContainer);

        // Close modal when clicking backdrop
        this.modalContainer.addEventListener('click', (e) => {
            if (e.target === this.modalContainer) {
                this.closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalContainer.style.display === 'flex') {
                this.closeModal();
            }
        });
    }

    openModal(data = {}) {
        this.createModalContainer();
        if (!this.modalIframe.src) {

            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: this.props.embedToken,
                },
            };

            const modalConfiguration = {
                ...this.configuration,
                isModal: true,
                showListPage: false, // Force show form in modal
                showList: false, // Hide list in modal
                ...data
            };

            fetch(this.loginUrl, requestOptions)
                .then(async (response) => {
                    const result = await response.json();
                    const dataToPass = {
                        ...result?.data,
                        configuration: modalConfiguration,
                    };

                    const encodedData = encodeURIComponent(JSON.stringify(dataToPass));
                    const finalUrl = `${this.urlToRag}?ragDetails=${encodedData}`;
                    this.modalIframe.src = finalUrl;

                    this.modalContainer.style.display = 'flex';
                    document.body.style.overflow = 'hidden'; // Prevent background scrolling

                    return result;
                })
                .catch((error) => {
                    console.error('Fetch error:', error);
                });
        } else {
            this.modalContainer.style.display = 'flex';
        }
    }

    closeModal() {
        if (this.modalContainer) {
            this.modalContainer.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling

            // Refresh the main iframe to update the knowledge base list
            // if (this.iframe && this.iframe.src) {
            //     this.iframe.contentWindow.location.reload();
            // }
        }
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
                    configuration: { ...this.configuration, showList: !!this.props.parentId || null },
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
            this.iframe.style.display = 'block';
        }
    }

    closeIframe() {
        if (this.iframe) {
            this.iframe.style.display = 'none';
        }
    }
}

// Auto-initialize when script loads
new EmbedRag();