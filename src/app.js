import { app, provider } from './commons/kits/index';
import store from './store';

@app
@provider(store)
class MyApp {
    onLaunch() {
        console.log("app starting!");
    }
}
