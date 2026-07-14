package com.stellarstudio.bmcmod.client;

import net.minecraft.client.Minecraft;
import net.minecraft.world.InteractionHand;
import net.neoforged.api.distmarker.Dist;
import net.neoforged.bus.api.EventPriority;
import net.neoforged.bus.api.SubscribeEvent;
import net.neoforged.fml.common.EventBusSubscriber;
import net.neoforged.neoforge.client.event.InputEvent;
import net.neoforged.neoforge.network.PacketDistributor;

import com.stellarstudio.bmcmod.BmcMod;
import com.stellarstudio.bmcmod.item.BuilderWandItem;
import com.stellarstudio.bmcmod.network.BuilderWandPackets;

/** Touche "mode modifier" + molette : fait tourner l’orientation du placement (axe sur la face). */
@EventBusSubscriber(modid = BmcMod.MODID, value = Dist.CLIENT)
public final class BuilderWandClientScrollHandler {
    private BuilderWandClientScrollHandler() {
    }

    @SubscribeEvent(priority = EventPriority.HIGH)
    public static void onMouseScroll(InputEvent.MouseScrollingEvent event) {
        if (event.isCanceled()) {
            return;
        }
        Minecraft mc = Minecraft.getInstance();
        if (mc.player == null || mc.screen != null) {
            return;
        }
        if (BmcModKeyMappings.modeModifierKey == null || !BmcModKeyMappings.modeModifierKey.isDown()) {
            return;
        }
        double scrollY = event.getScrollDeltaY();
        if (Math.abs(scrollY) < 1.0E-4D) {
            return;
        }
        boolean hasWand = false;
        for (InteractionHand hand : InteractionHand.values()) {
            if (mc.player.getItemInHand(hand).getItem() instanceof BuilderWandItem) {
                hasWand = true;
                break;
            }
        }
        if (!hasWand) {
            return;
        }
        int delta = (int) Math.signum(scrollY);
        if (delta == 0) {
            return;
        }
        PacketDistributor.sendToServer(new BuilderWandPackets.BuilderWandAdjustPlacementTurnPayload(delta));
        event.setCanceled(true);
    }
}
