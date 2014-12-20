import util from '../../util.js';
import _ from 'lodash';
import Q from 'q';

export default {
  type: 'regexp',

  _render() {
    var matchContainer;

    matchContainer = this.container.group()
      .addClass('regexp-matches')
      .transform(Snap.matrix()
        .translate(20, 0));

    return Q.all(_.map(this.matches, match => {
      return match.render(matchContainer.group());
    }))
      .then(() => {
        var containerBox,
            paths;

        util.spaceVertically(this.matches, {
          padding: 5
        });

        containerBox = this.getBBox();
        paths = _.map(this.matches, this.makeConnectorLine.bind(this, containerBox));

        paths.push(this.makeSideLine(containerBox, _.first(this.matches)));
        paths.push(this.makeSideLine(containerBox, _.last(this.matches)));

        this.container.prepend(
          this.container.path(paths.join('')));

        matchContainer.prepend(
          matchContainer.path(_.map(this.matches, match => {
            var box = match.getBBox(),
                container = matchContainer.getBBox();

            return `M0,${box.ay}h${box.ax}M${box.ax2},${box.ay}H${container.width}`;
          }).join('')));
      });
  },

  makeSideLine(containerBox, match) {
    var box = match.getBBox(),
        direction = box.ay > containerBox.cy ? 1 : -1,
        distance = Math.abs(box.ay - containerBox.cy);

    if (distance >= 15) {
      let edge = box.ay - 10 * direction,
          shift = 10 * direction;

      return [
        `M0,${containerBox.cy}q10,0 10,${shift}V${edge}`,
        `M${containerBox.width + 40},${containerBox.cy}q-10,0 -10,${shift}V${edge}`
      ].join('');
    } else {
      return '';
    }
  },

  makeConnectorLine(containerBox, match) {
    var box = match.getBBox(),
        direction = box.ay > containerBox.cy ? 1 : -1,
        distance = Math.abs(box.ay - containerBox.cy);

    if (distance >= 15) {
      let curve = 10 * direction;

      return [
        `M10,${box.ay - curve}q0,${curve} 10,${curve}`,
        `M${containerBox.width + 30},${box.ay - curve}q0,${curve} -10,${curve}`
      ].join('');
    } else {
      let anchor = box.ay - containerBox.cy;

      return [
        `M0,${containerBox.cy}c10,0 10,${anchor} 20,${anchor}`,
        `M${containerBox.width + 40},${containerBox.cy}c-10,0 -10,${anchor} -20,${anchor}`
      ].join('');
    }
  },

  setup() {
    this.matches = [this.properties.match]
      .concat(_.map(this.properties.alternates.elements, element => {
        return element.properties.match;
      }));

    if (this.matches.length === 1) {
      return this.proxy = this.matches[0];
    }
  }
};
