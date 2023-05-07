/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */
const {
    Clutter, Shell, St,
} = imports.gi;

const Background = imports.ui.background;
const Layout = imports.ui.layout;
const Main = imports.ui.main;

const BLUR_BRIGHTNESS = 0.62;
const BLUR_SIGMA = 60;

class Extension {
    constructor() {        
    }

    _createBackground(monitorIndex) {
        let monitor = Main.layoutManager.monitors[monitorIndex];
        let widget = new St.Widget({
            style_class: 'ov-background',
            x: monitor.x,
            y: monitor.y,
            width: monitor.width,
            height: monitor.height,
            effect: new Shell.BlurEffect({ name: 'blur' }),
        });

        let bgManager = new Background.BackgroundManager({
            container: widget,
            monitorIndex,
            controlPosition: false,
        });

        this._bgManagers.push(bgManager);

        this._backgroundGroup.add_child(widget);
    }

    _updateBackgroundEffects() {
        const themeContext = St.ThemeContext.get_for_stage(global.stage);
        this._scaleChangedId = themeContext.connect('notify::scale-factor',
            () => this._updateBackgroundEffects());
        for (const widget of this._backgroundGroup) {
            const effect = widget.get_effect('blur');

            if (effect) {
                effect.set({
                    brightness: BLUR_BRIGHTNESS,
                    sigma: BLUR_SIGMA * themeContext.scale_factor,
                });
            }
        }
    }

    _updateBackgrounds() {
        for (let i = 0; i < this._bgManagers.length; i++)
            this._bgManagers[i].destroy();

        this._bgManagers = [];
        this._backgroundGroup.destroy_all_children();        

        for (let i = 0; i < Main.layoutManager.monitors.length; i++)
            this._createBackground(i);
        this._updateBackgroundEffects();
        this._monitorsChangedId =
            Main.layoutManager.connect('monitors-changed', this._updateBackgrounds.bind(this));
    }
    
    _onDestroy() {
        if (this._monitorsChangedId) {
            Main.layoutManager.disconnect(this._monitorsChangedId);
            delete this._monitorsChangedId;
        }

        let themeContext = St.ThemeContext.get_for_stage(global.stage);
        if (this._scaleChangedId) {
            themeContext.disconnect(this._scaleChangedId);
            delete this._scaleChangedId;
        } 

    }
    
    enable() {
        this._backgroundGroup = new Clutter.Actor();
        this._bgManagers = [];
        this._updateBackgrounds();
        Main.layoutManager.overviewGroup.insert_child_at_index(this._backgroundGroup, 0);
    }

    disable() {
        this._backgroundGroup.destroy();
        this._backgroundGroup = null;
    }
}

function init() {
    return new Extension();
}
