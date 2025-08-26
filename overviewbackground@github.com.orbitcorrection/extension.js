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

import Clutter from 'gi://Clutter';
import St from 'gi://St';
import Shell from 'gi://Shell';

import * as Background from 'resource:///org/gnome/shell/ui/background.js';
import * as Layout from 'resource:///org/gnome/shell/ui/layout.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export default class OvervievBackgroudExtension extends Extension {

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
        const BLUR_BRIGHTNESS = this._settings.get_int('blur-brightness')* 0.05;
        const BLUR_SIGMA = this._settings.get_int('blur-sigma')* 5;
        const themeContext = St.ThemeContext.get_for_stage(global.stage);
        this._signalnotifyscalefactor = themeContext.connectObject('notify::scale-factor',
            () => this._updateBackgroundEffects(), this);
        for (const widget of this._backgroundGroup) {
            const effect = widget.get_effect('blur');

            if (effect) {
                effect.set({
                    brightness: BLUR_BRIGHTNESS,
                    radius: BLUR_SIGMA / themeContext.scale_factor,
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
        this._signalmonitorchanged = Main.layoutManager.connectObject('monitors-changed',
            this._updateBackgrounds.bind(this), this);
    }

    enable() {
        this._settings = this.getSettings();
        this._backgroundGroup = new Clutter.Actor();
        this._bgManagers = [];
        this._updateBackgrounds();
        this._settingsChangeId = this._settings.connect("changed", () => {
            this._updateBackgrounds();
            });

        Main.layoutManager.overviewGroup.insert_child_at_index(this._backgroundGroup, 0);
    }

    disable() {
        if (this._settingsChangeId)
        this._settings.disconnect(this._settingsChangeId);
        this._settingsChangeId = null;
        this._settings = null;
        if (this._signalnotifyscalefactor) { 
            themeContext.disconnectObject(this._signalnotifyscalefactor);
            this._signalnotifyscalefactor = null;
        }
         if (this._signalmonitorchanged) {
            Main.layoutManager.disconnectObject(this._signalmonitorchanged);
            this._signalmonitorchanged = null;
        }
        this._backgroundGroup.destroy();
        this._backgroundGroup = null;       
    }
}
