package com.stellarstudio.bmcmod.registry;

import net.minecraft.core.registries.Registries;
import net.minecraft.core.BlockPos;
import net.minecraft.world.inventory.MenuType;
import net.minecraft.world.InteractionHand;

import com.stellarstudio.bmcmod.BmcMod;
import com.stellarstudio.bmcmod.block.endstonefurnace.EndstoneFurnaceBlockEntity;
import com.stellarstudio.bmcmod.block.foundry.FoundryBlockEntity;
import com.stellarstudio.bmcmod.block.infusion.InfusionTableBlockEntity;
import com.stellarstudio.bmcmod.block.upgradetable.UpgradeTableBlockEntity;
import com.stellarstudio.bmcmod.entity.CloneEntity;
import com.stellarstudio.bmcmod.menu.CloneInventoryMenu;
import com.stellarstudio.bmcmod.menu.EndstoneFurnaceMenu;
import com.stellarstudio.bmcmod.menu.FoundryMenu;
import com.stellarstudio.bmcmod.menu.BackpackChestMenu;
import com.stellarstudio.bmcmod.menu.BackpackContainer;
import com.stellarstudio.bmcmod.menu.InfusionTableMenu;
import com.stellarstudio.bmcmod.menu.UpgradeTableMenu;

import net.neoforged.neoforge.common.extensions.IMenuTypeExtension;
import net.neoforged.neoforge.registries.DeferredHolder;
import net.neoforged.neoforge.registries.DeferredRegister;

public final class ModMenus {
    public static final DeferredRegister<MenuType<?>> MENU_TYPES =
            DeferredRegister.create(Registries.MENU, BmcMod.MODID);

    public static final DeferredHolder<MenuType<?>, MenuType<BackpackChestMenu>> BACKPACK = MENU_TYPES.register("backpack",
            () -> IMenuTypeExtension.create((windowId, inv, buf) -> {
                int rows = buf.readVarInt();
                InteractionHand hand = buf.readBoolean() ? InteractionHand.OFF_HAND : InteractionHand.MAIN_HAND;
                return new BackpackChestMenu(ModMenus.BACKPACK.get(), windowId, inv, new BackpackContainer(rows * 9), rows, hand);
            }));

    public static final DeferredHolder<MenuType<?>, MenuType<InfusionTableMenu>> INFUSION_TABLE = MENU_TYPES.register("infusion_table", () ->
            IMenuTypeExtension.create((windowId, inv, buf) -> {
                BlockPos pos = buf.readBlockPos();
                if (inv.player.level().getBlockEntity(pos) instanceof InfusionTableBlockEntity be) {
                    return new InfusionTableMenu(ModMenus.INFUSION_TABLE.get(), windowId, inv, be);
                }
                throw new IllegalStateException("Missing InfusionTableBlockEntity at " + pos);
            }));

    public static final DeferredHolder<MenuType<?>, MenuType<EndstoneFurnaceMenu>> ENDSTONE_FURNACE = MENU_TYPES.register(
            "endstone_furnace",
            () -> IMenuTypeExtension.create((windowId, inv, buf) -> {
                var pos = buf.readBlockPos();
                if (inv.player.level().getBlockEntity(pos) instanceof EndstoneFurnaceBlockEntity be) {
                    return new EndstoneFurnaceMenu(windowId, inv, be);
                }
                throw new IllegalStateException("Missing EndstoneFurnaceBlockEntity at " + pos);
            }));

    public static final DeferredHolder<MenuType<?>, MenuType<FoundryMenu>> FOUNDRY = MENU_TYPES.register(
            "foundry",
            () -> IMenuTypeExtension.create((windowId, inv, buf) -> {
                var pos = buf.readBlockPos();
                if (inv.player.level().getBlockEntity(pos) instanceof FoundryBlockEntity be) {
                    return new FoundryMenu(ModMenus.FOUNDRY.get(), windowId, inv, be);
                }
                throw new IllegalStateException("Missing FoundryBlockEntity at " + pos);
            }));

    public static final DeferredHolder<MenuType<?>, MenuType<UpgradeTableMenu>> UPGRADE_TABLE = MENU_TYPES.register(
            "upgrade_table",
            () -> IMenuTypeExtension.create((windowId, inv, buf) -> {
                var pos = buf.readBlockPos();
                if (inv.player.level().getBlockEntity(pos) instanceof UpgradeTableBlockEntity be) {
                    return new UpgradeTableMenu(ModMenus.UPGRADE_TABLE.get(), windowId, inv, be);
                }
                throw new IllegalStateException("Missing UpgradeTableBlockEntity at " + pos);
            }));

    public static final DeferredHolder<MenuType<?>, MenuType<CloneInventoryMenu>> CLONE_INVENTORY = MENU_TYPES.register(
            "clone_inventory",
            () -> IMenuTypeExtension.create((windowId, inv, buf) -> {
                int eid = buf.readVarInt();
                if (inv.player.level().getEntity(eid) instanceof CloneEntity clone) {
                    return new CloneInventoryMenu(ModMenus.CLONE_INVENTORY.get(), windowId, inv, clone);
                }
                throw new IllegalStateException("Missing CloneEntity id " + eid);
            }));

    private ModMenus() {
    }
}
