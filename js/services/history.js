import {
    createBrowserHistory
} from "history";
const history = createBrowserHistory();

const hist = createBrowserHistory();
if (window.Cypress) {
    window.tgHistory = hist;
}

export default history;