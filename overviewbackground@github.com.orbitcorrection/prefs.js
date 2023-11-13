'use strict';

const {Adw, Gio, Gtk} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

function init() {
}

function fillPreferencesWindow(window) {
    const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.ob');
    
        const page = new Adw.PreferencesPage();
        const groupTarget = new Adw.PreferencesGroup({
            title: "Intensity of blur",
            description: "Set brightness and sigma",
        });
        page.add(groupTarget);
        

        const BlurBrightness = new Adw.ActionRow({
            title: "Blur Brightness",
        });
        groupTarget.add(BlurBrightness);

        const BlurBrightnessAdjustment = new Gtk.Adjustment({
            value: settings.get_int("blur-brightness"),
            lower: 0,
            upper: 20,
            step_increment: 1,
        });

        const BlurBrightnessSpinButton = new Gtk.SpinButton({
            adjustment: BlurBrightnessAdjustment,
            numeric: true,
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.END,
        });

        settings.bind(
            "blur-brightness",
            BlurBrightnessSpinButton.get_adjustment(),
            "value",
            Gio.SettingsBindFlags.DEFAULT
        );

        BlurBrightness.add_suffix(BlurBrightnessSpinButton);
        BlurBrightness.activatable_widget = BlurBrightnessSpinButton;

        const BlurSigma = new Adw.ActionRow({
            title: "Blur Sigma",
        });
        groupTarget.add(BlurSigma);

        const BlurSigmaAdjustment = new Gtk.Adjustment({
            value: settings.get_int("blur-sigma"),
            lower: 0,
            upper: 20,
            step_increment: 1,
        });

        const BlurSigmaSpinButton = new Gtk.SpinButton({
            adjustment: BlurSigmaAdjustment,
            numeric: true,
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.END,
        });

        settings.bind(
            "blur-sigma",
            BlurSigmaSpinButton.get_adjustment(),
            "value",
            Gio.SettingsBindFlags.DEFAULT
        );

        BlurSigma.add_suffix(BlurSigmaSpinButton);
        BlurSigma.activatable_widget = BlurSigmaSpinButton;

        window.add(page);
}
