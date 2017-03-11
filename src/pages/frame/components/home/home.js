import { mixin } from '../../../../commons/kits/index';

import Source from './source';
import Suggestions from './suggestions';
import Histories from './histories';

@mixin(Source, Histories, Suggestions)
export default class HomePage {

}
