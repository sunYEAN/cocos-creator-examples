// author: http://lamyoung.com/

import PhysicsPolygonColliderEx from "./PhysicsPolygonColliderEx";

const DIG_RADIUS = 50;
const DIG_FRAGMENT = 12;
const DIG_OPTIMIZE_SIZE = 1;


const { ccclass, property } = cc._decorator;

@ccclass
export default class Main_poly extends cc.Component {

    @property(cc.Graphics)
    graphics: cc.Graphics = null;

    @property(cc.Node)
    node_dirty: cc.Node = null;

    @property(cc.Node)
    node_ball: cc.Node = null;

    @property(cc.Node)
    node_qrCode: cc.Node = null;


    @property(PhysicsPolygonColliderEx)
    polyEx: PhysicsPolygonColliderEx = null;

    onLoad() {
        cc.macro.ENABLE_MULTI_TOUCH = false;

        cc.director.getPhysicsManager().enabled = true;
        // 开启物理步长的设置
        cc.director.getPhysicsManager().enabledAccumulator = true;

        // 物理步长，默认 FIXED_TIME_STEP 是 1/60
        cc.PhysicsManager.FIXED_TIME_STEP = 1 / 30;

        // 每次更新物理系统处理速度的迭代次数，默认为 10
        cc.PhysicsManager.VELOCITY_ITERATIONS = 8;

        // 每次更新物理系统处理位置的迭代次数，默认为 10
        cc.PhysicsManager.POSITION_ITERATIONS = 8;

        this.graphics.node.on(cc.Node.EventType.TOUCH_START, this._touchMove, this);
        this.graphics.node.on(cc.Node.EventType.TOUCH_MOVE, this._touchMove, this);

        this.graphics.fillColor = cc.Color.ORANGE;
    }

    start() {
        this.reset();
    }

    private _optimizePoint(point) {
        const x = Math.floor(point[0] * DIG_OPTIMIZE_SIZE) / DIG_OPTIMIZE_SIZE;
        const y = Math.floor(point[1] * DIG_OPTIMIZE_SIZE) / DIG_OPTIMIZE_SIZE;
        return cc.v2(x, y);
    }


    private _touchMove(touch: cc.Touch) {
        const regions: cc.Vec2[] = [];
        const pos = this.graphics.node.convertToNodeSpaceAR(touch.getLocation());
        const delta = touch.getDelta();
        const count = DIG_FRAGMENT;
        if (delta.lengthSqr() < 5) {
            for (let index = 0; index < count; index++) {
                const r = 2 * Math.PI * index / count;
                const x = pos.x + DIG_RADIUS * Math.cos(r);
                const y = pos.y + DIG_RADIUS * Math.sin(r);
                regions.push(this._optimizePoint([x, y]));
            }
        } else {
            const startPos = pos.sub(delta);
            for (let index = 0; index < count; index++) {
                const r = 2 * Math.PI * index / count;
                let vec_x = DIG_RADIUS * Math.cos(r);
                let vec_y = DIG_RADIUS * Math.sin(r);
                let x, y;
                if (delta.dot(cc.v2(vec_x, vec_y)) > 0) {
                    x = pos.x + vec_x;
                    y = pos.y + vec_y;
                } else {
                    x = startPos.x + vec_x;
                    y = startPos.y + vec_y;
                }
                regions.push(this._optimizePoint([x, y]));
            }

        }

        this.polyEx.pushCommand('polyDifference', [regions, this.graphics]);

    }

    reset() {
        this.polyEx.init([
            [cc.v2(-375, -667), cc.v2(-375, 500), cc.v2(-50, 500), cc.v2(-40, 450), cc.v2(40, 450), cc.v2(50, 500), cc.v2(375, 500), cc.v2(375, -667)]
        ]);
        this.polyEx.polyDifference([], this.graphics);

        this.node_ball.setPosition(0, 500);

    }




    private debug() {
        cc.debug.setDisplayStats(!cc.debug.isDisplayStats());
        cc.director.getPhysicsManager().debugDrawFlags = cc.debug.isDisplayStats() ? 1 : 0;
    }

    private showOrHideQrCode() {
        this.node_qrCode.active = !this.node_qrCode.active;
    }

}
// 欢迎关注微信公众号[白玉无冰]