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
    AccountsService, Atk, Clutter, Gdm, Gio,
    GnomeDesktop, GLib, GObject, Shell, St,
} = imports.gi;

const Background = imports.ui.background;
const Layout = imports.ui.layout;
const Main = imports.ui.main;

const BLUR_BRIGHTNESS = 0.65;
const BLUR_SIGMA = 60;

class Extension {
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
    }
    constructor() {        
    }

    enable() {
        this._backgroundGroup = new Clutter.Actor();
        Main.layoutManager.overviewGroup.insert_child_at_index(this._backgroundGroup, 0);
        
        this._bgManagers = [];

        const themeContext = St.ThemeContext.get_for_stage(global.stage);
        themeContext.connectObject('notify::scale-factor',
            () => this._updateBackgroundEffects(), this);

        this._updateBackgrounds();
        Main.layoutManager.connectObject('monitors-changed',
            this._updateBackgrounds.bind(this), this);
    }

    disable() {
    Main.layoutManager.overviewGroup.remove_child(this._backgroundGroup);
    }
}

function init() {
    return new Extension();
}
