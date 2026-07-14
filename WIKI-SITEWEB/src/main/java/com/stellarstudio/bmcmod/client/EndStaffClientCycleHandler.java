package com.stellarstudio.bmcmod.client;

import org.lwjgl.glfw.GLFW;

import net.minecraft.client.Minecraft;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.PickaxeItem;
import net.neoforged.api.distmarker.Dist;
import net.neoforged.bus.api.EventPriority;
import net.neoforged.bus.api.SubscribeEvent;
import net.neoforged.fml.common.EventBusSubscriber;
import net.neoforged.neoforge.client.event.InputEvent;
import net.neoforged.neoforge.network.PacketDistributor;

import com.stellarstudio.bmcmod.BmcMod;
import com.stellarstudio.bmcmod.item.BuilderWandItem;
import com.stellarstudio.bmcmod.network.BuilderWandPackets;
import com.stellarstudio.bmcmod.network.DragonStaffPackets;
import com.stellarstudio.bmcmod.network.EndStaffPackets;
import com.stellarstudio.bmcmod.network.ExcavatorPackets;
import com.stellarstudio.bmcmod.network.IceStaffPackets;
import com.stellarstudio.bmcmod.network.WitherStaffPackets;
import com.stellarstudio.bmcmod.item.ScytheItem;
import com.stellarstudio.bmcmod.network.ScythePackets;
import com.stellarstudio.bmcmod.registry.ModItems;

/**
 * Touche "mode modifier" + clic droit : cycle des modes sans déclencher l’action en cours.
 */
@EventBusSubscriber(modid = BmcMod.MODID, value = Dist.CLIENT)
public final class EndStaffClientCycleHandler {
    private EndStaffClientCycleHandler() {
    }

    @SubscribeEvent(priority = EventPriority.HIGH)
    public static void onMouse(InputEvent.MouseButton.Pre event) {
        if (event.getButton() != GLFW.GLFW_MOUSE_BUTTON_RIGHT || event.getAction() != GLFW.GLFW_PRESS) {
            return;
        }
        Minecraft mc = Minecraft.getInstance();
        if (mc.player == null || mc.screen != null) {
            return;
        }
        if (BmcModKeyMappings.modeModifierKey == null || !BmcModKeyMappings.modeModifierKey.isDown()) {
            return;
        }

        boolean sneaking = mc.player.isShiftKeyDown();
        boolean hasBuilderWand = false;
        for (InteractionHand hand : InteractionHand.values()) {
            if (mc.player.getItemInHand(hand).getItem() instanceof BuilderWandItem) {
                hasBuilderWand = true;
                break;
            }
        }
        if (sneaking && hasBuilderWand) {
            PacketDistributor.sendToServer(new BuilderWandPackets.BuilderWandCycleMaterialPayload());
            event.setCanceled(true);
            return;
        }

        for (InteractionHand hand : InteractionHand.values()) {
            ItemStack stack = mc.player.getItemInHand(hand);
            if (stack.getItem() instanceof BuilderWandItem) {
                PacketDistributor.sendToServer(new BuilderWandPackets.BuilderWandCycleModePayload());
                event.setCanceled(true);
                return;
            }
            if (stack.getItem() instanceof ScytheItem) {
                PacketDistributor.sendToServer(new ScythePackets.ScytheCycleAreaPayload());
                event.setCanceled(true);
                return;
            }
            if (stack.is(ModItems.DRAGON_STAFF.get())) {
                PacketDistributor.sendToServer(new DragonStaffPackets.DragonStaffCycleModePayload());
                event.setCanceled(true);
                return;
            }
            if (stack.is(ModItems.END_STAFF.get())) {
                PacketDistributor.sendToServer(new EndStaffPackets.EndStaffCycleModePayload());
                event.setCanceled(true);
                return;
            }
            if (stack.is(ModItems.WITHER_STAFF.get())) {
                PacketDistributor.sendToServer(new WitherStaffPackets.WitherStaffCycleModePayload());
                event.setCanceled(true);
                return;
            }
            if (stack.is(ModItems.ICE_STAFF.get())) {
                PacketDistributor.sendToServer(new IceStaffPackets.IceStaffCycleModePayload());
                event.setCanceled(true);
                return;
            }
            if (stack.getItem() instanceof PickaxeItem && stack.isEnchanted()) {
                PacketDistributor.sendToServer(new ExcavatorPackets.ExcavatorToggleModePayload());
                event.setCanceled(true);
                return;
            }
        }
    }
}
